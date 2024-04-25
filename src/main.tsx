import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";

import App from "./App";
import { config } from "./wagmi";

import { InputName } from "./inputName";
import { Loading } from "./loading";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
        <InputName />
        <Loading />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
