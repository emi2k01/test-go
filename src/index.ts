import path from "path";
const _require = require;
function pseudoRequire(id: string) {
  const externalPath = _require.resolve(id, {
    paths: [path.dirname(process.execPath), __dirname],
  });
  return _require(externalPath);
}
Object.defineProperties(pseudoRequire, {
  extensions: { value: require.extensions },
  resolve: { value: require.resolve },
  cache: { value: require.cache },
  main: { value: require.main },
});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
require = pseudoRequire;

import { listen } from "./server";

try {
  listen();
} catch (e) {
  console.log(e);
}
