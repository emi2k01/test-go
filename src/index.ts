import {
  printer as ThermalPrinter,
  types as PrinterTypes,
} from "node-thermal-printer";
import { format } from "date-fns";
import printerDriver from "@thiagoelg/node-printer";
import { createInterface } from "readline";
import express, { Request } from "express";
import Ticket from "./ticket";

let printer: ThermalPrinter;

async function main() {
  const app = express();
  app.use(express.json());

  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const printerNameInput = await new Promise((resolve) => {
    readline.question("Printer name (auto): ", resolve);
  });

  const printerName = printerNameInput === "" ? "auto" : printerNameInput;
  console.log("Looking for printer:", printerName);

  printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: `printer:${printerName}`,
    characterSet: "ISO8859_2_LATIN2",
    driver: printerDriver,
  });
  console.log(`Printer connected: ${await printer?.isPrinterConnected()}`);

  // const port = Number.parseInt(
  //   (await new Promise((resolve) => {
  //     readline.question("Listen on port (4009): ", resolve);
  //   })) || "4009"
  // );

  // app.get(
  //   "/",
  //   async (
  //     req: Request<Record<string, unknown>, Record<string, unknown>, Ticket>,
  //     res
  //   ) => {
  //     const ticket = req.body;
  //     try {
  //       await print(ticket);
  //       return res.status(200).send();
  //     } catch (e) {
  //       return res.status(500).send();
  //     }
  //   }
  // );

  // app.listen(port, () => {
  //   console.log(`Listening on port ${port}`);
  // })
  print({
    cashier: "Andres Mejias",
    customer: "Emilio Gonzalez",
    order: 1293,
    payments: [
      {
        amount: 123.32,
        method: "VISA",
      },
      {
        amount: 91.4,
        method: "CASH",
      },
    ],
    products: [
      {
        price: 12.0,
        qty: 4,
        sku: "4532",
        title: "Golden chain #12",
        total: 12 * 4,
        discount: 0,
      },
      {
        price: 192.2,
        qty: 16,
        sku: "8972",
        title: "Silver medal",
        total: 192.2 * 16,
        discount: 15,
      },
      {
        price: 121.0,
        qty: 1,
        sku: "2315",
        title: "Mother's day bracelet very long bracelet really",
        total: 121,
        discount: 5,
      },
      {
        price: 124.0,
        qty: 4,
        sku: "4532",
        title: "Golden chain #12",
        total: 12 * 4,
        discount: 0,
      },
      {
        price: 2.0,
        qty: 72,
        sku: "4322",
        title: "Gold pin",
        total: 72 * 2,
        discount: 10,
      },
    ],
    store: "1",
    subtotal: 401.34,
    taxAmount: 23,
    taxPercentage: 7,
    total: 424.34,
    totalDiscount: 20.32,
    workstation: 1,
  });
}

async function print(ticket: Ticket) {
  printer.underline(false);
  // const totalColumns = 47;
  printer.alignLeft();

  // DATE     ORDER #
  const date = format(new Date(), "MM/dd/yyyy");
  printer.leftRight(date, ticket.order.toString());
  // STORE    WORKSTATION
  const store = `Store: ${ticket.store}`;
  const workstation = `Workstation: ${ticket.workstation}`;
  printer.leftRight(store, workstation);

  // REPRINTED
  // LOGO
  // GOLD TREE
  // INFO
  printer.alignCenter();
  printer.bold(true);
  printer.println("REPRINTED");
  await printer.printImage("./logo.png");
  printer.setTextDoubleHeight();
  printer.setTextDoubleWidth();
  printer.println("GOLD TREE");
  printer.bold(false);
  printer.setTextNormal();
  printer.println("755 NW 72nd AVE PLAZA 33");
  printer.println("MIAMI, FL, 33126");
  printer.println("TELF +1 (786) 7177131");
  printer.alignLeft();

  // BILL TO
  printer.bold(true);
  printer.println("    Bill to:");
  printer.bold(false);
  printer.println(`            ${ticket.customer}`);
  printer.println(`Cashier: ${ticket.cashier}`);
  printer.newLine();

  printer.underline(true);
  //printer.println("Item #               Qty    Price    Ext Price");
  printer.tableCustom([
    {
      text: "Item #",
      align: "LEFT",
      cols: 19,
    },
    {
      text: "Qty",
      align: "RIGHT",
      cols: 3,
    },
    {
      text: "",
      align: "CENTER",
      cols: 3,
    },
    {
      text: "D%",
      align: "RIGHT",
      cols: 3,
    },
    {
      text: "",
      align: "CENTER",
      cols: 2,
    },
    {
      text: "Price",
      align: "RIGHT",
      cols: 7,
    },
    {
      text: "",
      align: "CENTER",
      cols: 2,
    },
    {
      text: "Total",
      align: "LEFT",
      cols: 7,
    },
  ]);

  printer.underline(false);
  for (const product of ticket.products) {
    printer.tableCustom([
      {
        text: `${product.sku} ${product.title}`.substring(0, 14) + "...",
        align: "LEFT",
        cols: 19,
      },
      {
        text: product.qty.toString(),
        align: "RIGHT",
        cols: 3,
      },
      {
        text: "",
        align: "CENTER",
        cols: 3,
      },
      {
        text: product.discount ? product.discount + "%" : "",
        align: "RIGHT",
        cols: 3,
      },
      {
        text: "",
        align: "CENTER",
        cols: 2,
      },
      {
        text: `$${product.price.toFixed(2)}`,
        align: "RIGHT",
        cols: 7,
      },
      {
        text: "",
        align: "CENTER",
        cols: 2,
      },
      {
        text: `$${product.total.toFixed(2)}`,
        align: "LEFT",
        cols: 7,
      },
    ]);
  }

  printer.alignRight();

  let subtotalString = `$${ticket.subtotal.toFixed(2)}`;
  let taxString = `+$${ticket.taxAmount.toFixed(2)}`;
  let totalString = `$${ticket.total}`;

  const maxLength = Math.max(
    subtotalString.length,
    taxString.length,
    totalString.length
  );

  subtotalString = subtotalString.padStart(maxLength, " ");
  taxString = taxString.padStart(maxLength, " ");
  totalString = totalString.padStart(maxLength, " ");

  printer.println(`Subtotal: ${subtotalString}`);
  printer.println(
    `Local Sales Tax    ${ticket.taxPercentage}% Tax: ${taxString}`
  );
  printer.bold(true);
  printer.println(`RECEIPT TOTAL: ${totalString}`);
  printer.bold(false);
  printer.alignLeft();
  for (const payment of ticket.payments) {
    printer.println(`   ${payment.method}: $${payment.amount}`);
  }
  printer.alignRight();
  printer.println(`Total Sales Discounts:    $${ticket.totalDiscount}`);
  printer.alignCenter();
  printer.println("Thanks for shopping with us!");
  printer.println("All sales are final");
  printer.println("No exchanges. No returns");
  printer.cut();

  try {
    await printer.execute();
    console.log("Print success!");
  } catch (e) {
    console.error("failed to print", e);
  }
}

main();
