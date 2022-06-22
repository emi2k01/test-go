import Payment from "./payment";
import Product from "./product";

export default interface Ticket {
  order: number,
  customer: string,
  cashier: string,
  store: string,
  workstation: number,
  products: Product[],
  payments: Payment[],
  subtotal: number,
  taxPercentage: number,
  taxAmount: number,
  total: number,
  totalDiscount: number,
  columns: number[],
}