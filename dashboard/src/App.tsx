import React from "react";
import * as M from "@mantine/core";
import { client } from "./api";
import logoUrl from "@/img/gold-tree-logo.png";
import { showNotification } from "@mantine/notifications";

function App() {
  const [printers, setPrinters] = React.useState([]);
  const [selectedPrinter, setSelectedPrinter] = React.useState<string | null>(
    null
  );

  React.useEffect(() => {
    (async () => {
      const { data: printersData } = await client.get("/printers");
      setPrinters(
        printersData.map((printer: any) => ({
          label: printer,
          value: printer,
        }))
      );
      const { data: selectedPrinterData } = await client.get("/printer");
      setSelectedPrinter(selectedPrinterData);
    })();
  }, []);

  const handlePrinterChange = React.useCallback((printerName: string) => {
    (async () => {
      try {
        setSelectedPrinter(printerName);
        await client.post("/printer", printerName, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        showNotification({
          title: "Default receipt printer updated",
          message: "",
          color: "green",
        });
      } catch (e: any) {
        showNotification({
          title: "Failed to update default receipt printer",
          message: e.message ?? "",
          color: "red",
        });
      }
    })();
  }, []);

  return (
    <M.Paper
      shadow="xs"
      sx={{ position: "absolute", inset: "min(80px, (100vh * 0.05))" }}
    >
      <M.Stack align="center">
        <M.Image src={logoUrl} sx={{ maxWidth: "400px" }} />
        <M.Select
          label="Receipt printer"
          required
          data={printers}
          value={selectedPrinter}
          onChange={handlePrinterChange}
          size="xl"
        />
      </M.Stack>
      <M.Text
        sx={{
          position: "absolute",
          bottom: "2rem",
          right: "2rem",
          opacity: "0.75",
        }}
      >
        Tip: bookmark me!
      </M.Text>
    </M.Paper>
  );
}

export default App;
