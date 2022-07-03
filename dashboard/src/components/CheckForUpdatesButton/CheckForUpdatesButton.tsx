import { client } from "@/api";
import * as M from "@mantine/core";
import { useMantineTheme } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import React from "react";

export function CheckForUpdatesButton(sx?: M.Sx) {
  const [loading, setLoading] = React.useState(false);
  const [updateStatus, setUpdateStatus] = React.useState<
    "available" | "none" | "unknown"
  >("unknown");

  const handleCheckForUpdatesClick = React.useCallback(() => {
    (async function () {
      setLoading(true);
      try {
        const { data } = await client.get("/update");
        if (data) {
          showNotification({
            title: "There's an update available",
            message:
              "Update to the latest version for bugfixes and more functionality",
            color: "green",
          });
          setUpdateStatus("available");
        } else {
          showNotification({
            title: "No updates available",
            message: "You are using the latest version",
            color: "gray",
          });
          setUpdateStatus("none");
        }
      } catch (e: any) {
        showNotification({
          title: "Failed to check for updates",
          message: e.message ?? "",
          color: "red",
        });
      }

      setLoading(false);
    })();
  }, []);

  const handleUpdateClick = React.useCallback(() => {
    (async function () {
      try {
        setLoading(true);
        const { status } = await client.post("/update");
        if (status >= 200 && status <= 299) {
          showNotification({
            title: "Updated to latest version",
            message: "You are now using the latest version!",
            color: "green",
          });
          setUpdateStatus("none");
          window.setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      } catch (e: any) {
        showNotification({
          title: "Failed to update to latest version",
          message: e.message ?? "",
          color: "red",
        });
      }

      setLoading(false);
    })();
  }, []);

  React.useEffect(() => {
    window.setTimeout(() => {
      setUpdateStatus("unknown");
    }, 2 * 60 * 1000);
  }, [updateStatus]);

  const theme = useMantineTheme();
  console.log(theme.colors.gray[5]);
  return (
    <M.Button
      color={
        updateStatus === "available"
          ? "green"
          : theme.colorScheme === "dark"
          ? "dark"
          : "gray"
      }
      onClick={
        updateStatus === "available"
          ? handleUpdateClick
          : handleCheckForUpdatesClick
      }
      loading={loading}
      disabled={updateStatus === "none"}
      sx={sx}
    >
      {updateStatus === "available"
        ? "Update to latest version"
        : "Check for updates"}
    </M.Button>
  );
}
