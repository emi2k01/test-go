export default interface Product {
  sku: string,
  title: string,
  qty: number,
  discount?: number,
  price: number,
  total: number,
}