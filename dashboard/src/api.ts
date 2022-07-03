import axios from "axios";

export const client = axios.create({
  baseURL: "http://localhost:4455/",
  timeout: 3000,
});
