import { format } from "date-fns";
import { printer as ThermalPrinter } from "node-thermal-printer";
import Ticket from "./ticket";

export async function printTicket(printer: ThermalPrinter, ticket: Ticket) {
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
      cols: ticket.columns[0] || 19,
    },
    {
      text: "Qty",
      align: "RIGHT",
      cols: ticket.columns[1] || 3,
    },
    {
      text: "",
      align: "CENTER",
      cols: ticket.columns[2] || 3,
    },
    {
      text: "D%",
      align: "RIGHT",
      cols: ticket.columns[3] || 3,
    },
    {
      text: "",
      align: "CENTER",
      cols: ticket.columns[4] || 3,
    },
    {
      text: "Price",
      align: "RIGHT",
      cols: ticket.columns[5] || 8,
    },
    {
      text: "",
      align: "CENTER",
      cols: ticket.columns[6] || 3,
    },
    {
      text: "Total",
      align: "LEFT",
      cols: ticket.columns[7] || 8,
    },
  ]);

  printer.underline(false);
  for (const product of ticket.products) {
    const itemCell = `${product.sku} ${product.title}`;
    printer.tableCustom([
      {
        text: itemCell.substring(0, 17),
        align: "LEFT",
        cols: ticket.columns[0] || 19,
      },
      {
        text: product.qty.toString(),
        align: "RIGHT",
        cols: ticket.columns[1] || 3,
      },
      {
        text: "",
        align: "CENTER",
        cols: ticket.columns[2] || 3,
      },
      {
        text: product.discount ? product.discount + "%" : "",
        align: "RIGHT",
        cols: ticket.columns[3] || 3,
      },
      {
        text: "",
        align: "CENTER",
        cols: ticket.columns[4] || 3,
      },
      {
        text: `$${product.price.toFixed(2)}`,
        align: "RIGHT",
        cols: ticket.columns[5] || 8,
      },
      {
        text: "",
        align: "CENTER",
        cols: ticket.columns[6] || 3,
      },
      {
        text: `$${product.total.toFixed(2)}`,
        align: "LEFT",
        cols: ticket.columns[7] || 8,
      },
    ]);
    printer.tableCustom([
      {
        text: itemCell.substring(17, 34),
        align: "LEFT",
        cols: ticket.columns[0] || 19,
      },
      {
        text: "",
        align: "RIGHT",
        cols: ticket.columns[1] || 3,
      },
      {
        text: "",
        align: "CENTER",
        cols: ticket.columns[2] || 3,
      },
      {
        text: "",
        align: "RIGHT",
        cols: ticket.columns[3] || 3,
      },
      {
        text: "",
        align: "CENTER",
        cols: ticket.columns[4] || 2,
      },
      {
        text: product.discount
          ? `-$${(product.price * (product.discount / 100.0)).toFixed(2)}`
          : "",
        align: "RIGHT",
        cols: ticket.columns[5] || 8,
      },
      {
        text: "",
        align: "CENTER",
        cols: ticket.columns[6] || 3,
      },
      {
        text: "",
        align: "LEFT",
        cols: ticket.columns[7] || 8,
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
