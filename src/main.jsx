import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// V2 API: WalletConnectProvider (bukan WalletProvider)
import { WalletConnectProvider } from "@btc-vision/walletconnect";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <WalletConnectProvider theme="dark">
      <App />
    </WalletConnectProvider>
  </StrictMode>
);