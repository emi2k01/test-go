import { Global, MantineProvider } from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import { NotificationsProvider } from "@mantine/notifications";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(<Index />);

function Index() {
  const preferredColorScheme = useColorScheme();

  return (
    <React.StrictMode>
      <MantineProvider
        theme={{ colorScheme: preferredColorScheme }}
        withGlobalStyles
        withNormalizeCSS
      >
        <NotificationsProvider>
          <Global
            styles={theme => ({
              body: {
                backgroundColor:
                  preferredColorScheme === "light"
                    ? theme.colors.gray[1]
                    : theme.colors.dark[8],
              },
            })}
          />
          <App />
        </NotificationsProvider>
      </MantineProvider>
    </React.StrictMode>
  );
}
