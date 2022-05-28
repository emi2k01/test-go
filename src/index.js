import {
  printer as ThermalPrinter,
  types as PrinterTypes,
} from "node-thermal-printer";
import { format } from "date-fns";
import printerDriver from "@thiagoelg/node-printer";
import { createInterface } from "readline";

async function main() {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let printerNameInput = await new Promise(resolve => {
    readline.question("Printer name (auto): ", resolve);
  });

  const printerName = printerNameInput === "" ? "auto" : printerNameInput;
  console.log("Looking for printer:", printerName);
  
  let printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: `printer:${printerName}`,
    characterSet: "ISO8859_2_LATIN2",
    driver: printerDriver,
  });

  console.log(`Printer connected: ${await printer.isPrinterConnected()}`);

  printer.underline(false)
  // const totalColumns = 47;
  printer.alignLeft();

  // DATE     ORDER #
  const date = format(new Date(), "MM/dd/yyyy");
  const orderNum = "Order number: 12345678";
  printer.leftRight(date, orderNum);
  // STORE    WORKSTATION
  const store = "Store: 1";
  const workstation = "Workstation: 7";
  printer.leftRight(store, workstation);

  // REPRINTED
  // LOGO
  // GOLD TREE
  // INFO
  printer.alignCenter();
  printer.bold(true);
  printer.println("REPRINTED");
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
  printer.println("            Kenia Escobar");
  printer.println("Cashier: Reina");
  printer.newLine();

  printer.underline(true);
  //printer.println("Item #               Qty    Price    Ext Price");
  printer.tableCustom([
    {
      text: "Item #",
      align: "LEFT",
      width: 0.35,
    },
    {
      text: "Qty",
      align: "RIGHT",
      width: 0.10,
    },
    {
      text: "",
      align: "CENTER",
      width: 0.05
    },
    {
      text: "Price",
      align: "LEFT",
      width: 0.25,
    },
    {
      text: "Ext Price",
      align: "LEFT",
      width: 0.25,
    },
  ]);

  printer.underline(false);
  printer.tableCustom([
    {
      text: "14063",
      align: "LEFT",
      width: 0.35,
    },
    {
      text: "8",
      align: "RIGHT",
      width: 0.15,
    },
    {
      text: "$3.15",
      align: "LEFT",
      width: 0.25,
    },
    {
      text: "$25.20",
      align: "RIGHT",
      width: 0.25,
    },
  ]);
  printer.tableCustom([
    {
      text: " Eye Round Bizel B Adding More Text To Test Overflow Of Text",
      align: "LEFT",
      width: 0.35,
    },
    {
      text: "D%",
      align: "RIGHT",
      width: 0.2,
    },
    {
      text: "10%",
      align: "LEFT",
      width: 0.25,
    },
    {
      text: "",
      align: "RIGHT",
      width: 0.25,
    },
  ]);

  printer.alignRight();
  printer.println("Subtotal:    $321.32");
  printer.println("Local Sales Tax         7% Tax:      +$22.49");
  printer.bold(true);
  printer.println("RECEIPT TOTAL: $343.81");
  printer.bold(false);
  printer.alignLeft();
  printer.println("   Credit Card: $343.81");
  printer.println("   Visa");
  printer.alignRight();
  printer.println("Total Sales Discounts:    $260.52");
  printer.alignCenter();
  printer.println("Thanks for shopping with us!");
  printer.println("All sales are final");
  printer.println("No exchanges. No returns");

  try {
    await printer.execute();
    console.log("Print success!");
  } catch (e) {
    console.error("failed to print", e);
  }
}

main();
