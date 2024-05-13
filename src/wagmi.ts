import { http, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";

import { DomainWalletENS } from "../lib/nameResolvers/DomainWalletENS";
import { loginWithName } from "../lib/loginWithName";
import { toggleWCUri } from "./connect";
import { requestName } from "./inputName";
import { showLoading } from "./loading";

const nameResolver = new DomainWalletENS({
  litNetwork: import.meta.env.VITE_LIT_NETWORK || "cayenne",
  chain: sepolia,
});

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    loginWithName({
      options: {
        debug: true,
        chain: sepolia,
        wcConfig: {
          projectId: import.meta.env.VITE_WC_PROJECT_ID,
          metadata: {
            name: "Login with Name",
            description: "Log in with your own name",
            url: window.location.origin,
            icons: ['https://github.com/FedericoAmura/login-with-name-wagmi-sdk/blob/main/public/loginWithName.png?raw=true']
          },
        },
        reloadOnDisconnect: false,
        toggleLoading: showLoading,
        nameResolver,
        getDomainName: requestName,
        toggleWCUri: toggleWCUri,
      },
    }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config
  }
}
