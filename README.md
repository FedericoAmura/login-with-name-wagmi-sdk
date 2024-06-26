<div align="center">
<h1>Login with Name Wagmi Connector</h1>

<img src="https://github.com/FedericoAmura/login-with-name-wagmi-sdk/blob/main/public/loginWithName.png?raw=true">

A [Wagmi](https://wagmi.sh/) connector that follows [CAIP-275][],
allowing you to add login with name into your dApp for any EMV chain.

</div>

# Usage

```typescript
// In wagmi.ts or wherever you configure wagmi
import { http, createConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { loginWithName } from "login-with-name";
import { ENS } from "login-with-name/nameResolvers";

const chain = mainnet;
const jsonRpcUrl = "https://eth.llamarpc.com";

const nameResolver = new ENS({
  chain,
  jsonRpcUrl,
});

const requestName = async () => {
  // Here you can prompt the user for their name
  return "vitalik.eth";
};

const lwnConfig = {
  options: {
    wcConfig: {
      projectId: "WALLETCONNECT_PROJECT_ID",
      metadata: {
        name: "Login with Name",
        description: "Log in with a domain name",
        url: window.location.origin,
        icons: ['https://avatars.githubusercontent.com/u/37784886']
      },
    },
    nameResolver,
    getName: requestName,
  },
};

const config = createConfig({
  chains: [mainnet],
  connectors: [loginWithName(lwnConfig)],
  transports: {
    [mainnet.id]: http(),
  },
});
```

Then in your dApp you can use Login with Name connector like you would use any other Wagmi connector

```tsx
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useEnsName,
} from "wagmi";

export interface HomeProps {
}

export function Home({}: HomeProps) {
  const account = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect, connectors: connectedConnectors } = useDisconnect();
  const balance = useBalance({
    address: account.addresses?.[0],
  });
  const ensName = useEnsName({
    address: account.addresses?.[0],
  });
  const loginWithNameConnector = connectors.find((c) => c.id === "loginWithName")!;

  const disconnectConnectors = () => {
    connectedConnectors.forEach((connector) => {
      disconnect({ connector });
    });
  };

  return (
    <div className="home">

      {account.status === "connected" ? (
        <>
          <h2>Your account 🔗</h2>

          <div>
            <p><span>Status:</span> {account.status}</p>
            <p><span>Addresses:</span> {JSON.stringify(account.addresses)}</p>
            <p><span>Balance:</span> {Number(balance.data?.formatted) || 0} {balance.data?.symbol}</p>
            <p><span>Chain Id:</span> {account.chainId}</p>
            {ensName.data && <p><span>ENS Name:</span> {ensName.data}</p>}
          </div>

          <button type="button" onClick={disconnectConnectors}>
            🔌 Disconnect
          </button>
        </>
      ) : (
        <>
          <h2>Connect to your wallet</h2>

          <button onClick={() => connect({ connector: loginWithNameConnector })}>
            <img src="/loginWithName.png" alt="Login With Name" />
            Login With Name
          </button>
        </>
      )}
    </div>
  );
}
```

# Installation

```bash
npm install login-with-name
```

# Configuration

The connector receives an object with several attributes to customize its behavior.

| Param                                 | Description                                                                                                                                                                       | Required | Default |
|---------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|---------|
| options                               | Object with the following attributes                                                                                                                                              | Yes      | -       |
| options.getName                       | Function that returns the name to be used in the login. Will be called at connection                                                                                        | Yes      | -       |
| options.toggleWCUri                   | Function that notifies dApp about the WalletConnect URI, domain name, address and wallet URI. Will be called when connector requests connection from a wallet using Wallet Connect | No       | -       |
| options.nameResolver                  | Instance of a class that implements the `NameResolver` interface. Will be used to resolve domain names and get authentication flows                                               | No       | ENS     |
| options.chain                         | Chain the connector will use                                                                                                                                                      | No       | mainnet |
| options.wcConfig                      | Configuration object for WalletConnect as specified in [their docs](https://docs.walletconnect.com/advanced/providers/ethereum)                                                   | Yes      | -       |
| options.wcConfig.projectId            | WalletConnect project ID                                                                                                                                                          | Yes      | -       |
| options.wcConfig.metadata             | Metadata object for the WalletConnect EthereumProvider provider                                                                                                                   | Yes      | -       |
| options.wcConfig.metadata.name        | Name of the dApp                                                                                                                                                                  | Yes      | -       |
| options.wcConfig.metadata.description | Description of the dApp                                                                                                                                                           | Yes      | -       |
| options.wcConfig.metadata.url         | URL of the dApp                                                                                                                                                                   | Yes      | -       |
| options.wcConfig.metadata.icons       | Array of URLs for the dApp icons                                                                                                                                                  | Yes      | -       |
| options.reloadOnDisconnect            | Whether to reload the connection when the user disconnects                                                                                                                        | No       | false   |
| options.toggleLoading                 | Function to toggle loading state so dApp can show corresponding loading UI and inform the user what is happening                                                                  | No       | -       |
| options.debug                         | Whether to log debug messages                                                                                                                                                     | No       | false   |

# Demo

A working demo can be accessed at [this link](https://login-with-name-wagmi-sdk.vercel.app/)

The source of the website can be found in the `src` folder. The website provides a way to prompt the user for their names using a modal. After users have logged in, they can see their account information, sign a test message and disconnect from the wallet.
Apart from that, the website demo provides instructions to get a named wallet such as [Domain Wallet](https://domainwallet.id) or use ENS to name any wallet that you can reference within the authentication flows.

There is also a server in the `authenticator` directory, whose sole responsibility is to store and handle authentication configurations for given names.

# How it works?

The included wagmi connector uses the [CAIP-275][] standard to resolve the name, its authentication flows and to find and connect with the indicated wallet.

[CAIP-275][] is a standard that allows you to resolve a name to authentication flows.
An authentication flow is a JSON object that contains the necessary information to authenticate the user and connect the wallet.

There are several steps involved in this process
1. When the user clicks on the "Login with Name" button, the connector will call the `getName` function to get the name from the user or dApp.
2. The connector will then use the `NameResolver` to resolve the name to an authentication configuration. This configuration is saved in a text record called `authenticator` under the name in a naming system like ENS.
3. If the authentication configuration is an URL, the connector will process the URL and fetch the actual authentication configuration.
4. The connector will then use the authentication flow configuration to authenticate the user and connect the wallet as described in the [CAIP-275][] standard.
5. Once the wallet connects back, the connector will handle the connection between dApp and wallet.

[CAIP-275]: https://github.com/ChainAgnostic/CAIPs/pull/275

# Contributing

This project is open to contributions. Feel free to open an issue or a pull request.
