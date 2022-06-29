import {
  printer as ThermalPrinter,
  types as PrinterTypes,
} from "node-thermal-printer";
import printerDriver from "@thiagoelg/node-printer";
import express, { Request } from "express";
import AutoLaunch from "auto-launch";
import cors from "cors";

const launcher = new AutoLaunch({
  name: "native",
  path: process.execPath,
});

launcher.enable();

launcher
  .isEnabled()
  .then(function (isEnabled) {
    if (isEnabled) {
      return;
    }
    launcher.enable();
  })
  .catch(function (err) {
    console.error(err);
  });

import Ticket from "./ticket";
import { printTicket } from "./print";

let printer: ThermalPrinter;

export async function listen() {
  const app = express();
  app.use(express.json());
  app.use(cors())

  const printerName = process.env.PRINTER || "auto";
  console.log("Looking for printer:", printerName);

  printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: `printer:${printerName}`,
    characterSet: "ISO8859_2_LATIN2",
    driver: printerDriver,
  });
  console.log(`Printer connected: ${await printer?.isPrinterConnected()}`);

  const port = Number.parseInt(process.env.PORT || "4009");

  app.post(
    "/",
    async (
      req: Request<Record<string, unknown>, Record<string, unknown>, Ticket>,
      res
    ) => {
      const ticket = req.body;
      try {
        await printTicket(printer, ticket);
        return res.status(200).send();
      } catch (e) {
        console.log(e);
        return res.status(500).send();
      }
    }
  );

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}
