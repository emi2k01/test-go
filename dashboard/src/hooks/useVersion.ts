import { client } from "@/api";
import React from "react";

export function useVersion() {
  const [version, setVersion] = React.useState("0.0.0");
  const [error, setError] = React.useState<any>(null);
  React.useEffect(() => {
    (async function () {
      try {
        const { data } = await client.get("/version");
        setVersion(data);
      } catch (e: any) {
        setError(error);
      }
    })();
  }, []);
  return {
    version,
    error
  }
}
