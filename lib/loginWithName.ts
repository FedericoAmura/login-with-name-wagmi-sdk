import { createConnector, type CreateConnectorFn } from "@wagmi/core";
import type WCProvider from "@walletconnect/ethereum-provider";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { createStore } from "mipd";
import {
  getAddress,
  type Address,
  type Chain,
  type EIP1193Provider,
  type ProviderConnectInfo,
  type ProviderRpcError,
  type ProviderMessage,
  UserRejectedRequestError,
} from "viem";
import { mainnet } from "viem/chains";
import "viem/window"; // To set types for window.ethereum

import { type NameResolver, ENS } from "./nameResolvers";

export enum LoginWithNameSteps {
  GET_DOMAIN_NAME = "get-domain-name",
  RESOLVE_DOMAIN_NAME = "resolve-domain-name",
  RESOLVE_AUTHENTICATOR = "resolve-authenticator",
  TRIGGER_AUTHENTICATION = "trigger-authentication",
}

export enum Platform {
  BROWSER = "browser",
  MOBILE = "mobile",
}

export enum Connection {
  EXTENSION = "extension",
  MWP = "mwp",
  WC = "wc",
}

export interface AuthFlow {
  platform?: Platform;
  connection: Connection;
  URI?: string;
}

export type Options = {
  /**
   * Function to get the domain name for the login
   * The connector will use this function to get the domain name
   */
  getDomainName: () => Promise<string> | string;
  /**
   * Function to pass the dApp the wcUri, domain name, address and wallet URI
   * This way dApp can show the QR code and open the wallet URI with a button if the auto-open fails
   */
  openWCUri?: (wcUri: string, domainName: string, address: Address, walletUri?: string) => void;
  /**
   * Name resolver to use for the provider
   */
  nameResolver?: NameResolver;
  /**
   * Chain to use for the provider
   * @default mainnet
   */
  chain?: Chain;
  /**
   * Wallet Connect config
   */
  wcConfig: {
    projectId: string;
    metadata: {
      name: string;
      description: string;
      url: string;
      icons: string[];
    };
  };
  /**
   * Whether to reload dapp connection automatically after disconnect.
   * @default false
   */
  reloadOnDisconnect?: boolean;
  /**
   * Function to toggle loading state so dapp can show corresponding loading UI
   */
  toggleLoading?: (step?: LoginWithNameSteps) => void;
  /**
   * Whether to print debug info
   * @default false
   */
  debug?: boolean;
};

export type LoginWithNameParameters = {
  options: Options;
};

type WagmiConnector = {
  readonly icon?: string | undefined
  readonly id: string;
  readonly name: string;
  readonly type: string;

  provider: EIP1193Provider | undefined;
  wcProvider: WCProvider | undefined;

  setup?(): Promise<void>;
  connect(parameters?:
            | { chainId?: number | undefined; isReconnecting?: boolean | undefined }
            | undefined,
  ): Promise<{
    accounts: readonly Address[]
    chainId: number
  }>;
  disconnect(): Promise<void>;
  getAccounts(): Promise<readonly Address[]>;
  getChainId(): Promise<number>;
  getProvider(
    parameters?: { chainId?: number | undefined } | undefined,
  ): Promise<EIP1193Provider>;
  isAuthorized(): Promise<boolean>;
  switchChain(parameters: { chainId: number | string }): Promise<Chain>;

  onAccountsChanged(accounts: string[]): void;
  onChainChanged(chainId: number | string): void;
  onConnect(connectInfo: ProviderConnectInfo): void;
  onDisconnect(error?: Error): void;
  onMessage(message: ProviderMessage): void;

  // Private members
  boundOnAccountsChanged?: (accounts: string[]) => void;
  boundOnChainChanged?: (chainId: string) => void;
  boundOnConnect?: (connectInfo: ProviderConnectInfo) => void;
  boundOnDisconnect?: (error?: Error) => void;
  boundOnMessage?: (message: ProviderMessage) => void;
  initializeEventListeners(): void;
};

// EIP-6963: https://eips.ethereum.org/EIPS/eip-6963
const eip6963Store = createStore();

export function loginWithName(parameters: LoginWithNameParameters): CreateConnectorFn {
  return createConnector<EIP1193Provider>((config) => {
    const { options } = parameters;

    const connector: WagmiConnector = {
      id: "loginWithName",
      name: "Login With Name",
      type: "injected",

      provider: undefined,
      wcProvider: undefined,

      async setup() {
        console.log("Setting up login with name connector");
      },
      async connect(parameters) {
        try {
          options.toggleLoading?.(LoginWithNameSteps.GET_DOMAIN_NAME);
          let domainName = await options.getDomainName();
          if (!domainName) {
            throw new Error("Domain name not provided");
          }

          options.toggleLoading?.(LoginWithNameSteps.RESOLVE_DOMAIN_NAME);
          const nameResolver = options.nameResolver || new ENS({ chain: options.chain });
          const [domainAddress, domainAuthenticator] = await Promise.all([
            nameResolver.resolveName(domainName),
            nameResolver.resolveAuthenticator(domainName),
          ]);
          if (!domainAddress || !domainAuthenticator) {
            throw new Error(`Could not resolve domain address or authenticator. Check Name Resolver records. Obtained address: ${domainAddress} and authenticator: ${domainAuthenticator}`);
          }

          options.toggleLoading?.(LoginWithNameSteps.RESOLVE_AUTHENTICATOR);
          let address: Address;
          let authFlows: AuthFlow[];
          try {
            // First try to resolve the authenticator as a URL
            const authenticatorURL = new URL(domainAuthenticator.replace("{}", domainName));
            authenticatorURL.searchParams.set("name", domainName); // Optional but an authenticator service might want other query params too
            const response = await fetch(authenticatorURL);
            const { address: resolvedAddress, authFlows: resolvedAuthMethods } = await response.json();
            address = resolvedAddress;
            authFlows = resolvedAuthMethods;
          } catch (error) {
            console.error(error);
            // If that fails, authenticator must be the JSON itself
            const { address: resolvedAddress, authFlows: resolvedAuthMethods } = JSON.parse(domainAuthenticator);
            address = resolvedAddress;
            authFlows = resolvedAuthMethods;
          }

          // Validate that the address in the authenticator matches the address resolved from the domain
          if (domainAddress !== address) {
            throw new Error("Address mismatch between name resolver and auth flow provider");
          }

          // Run the corresponding auth flow
          options.toggleLoading?.(LoginWithNameSteps.TRIGGER_AUTHENTICATION);
          const authFlow = authFlows[0]!; // TODO safely select this auth flow based on platform and supported methods

          if (authFlow.URI) {
            let provider: EIP1193Provider | undefined;
            if (authFlow.URI === "injected") {
              provider = window.ethereum!;
            } else {
              provider = eip6963Store.findProvider({ rdns: authFlow.URI })?.provider;
            }
            if (!provider) {
              throw new Error("Provider not found");
            }

            const accounts = await provider.request({ method: "eth_requestAccounts" });
            if (!accounts.includes(domainAddress.toLowerCase() as Address)) {
              throw new Error("Injected provider does not have the domain address");
            }
            const chainHex = await provider.request({ method: "eth_chainId" });
            const chainId = parseInt(chainHex, 16);
            this.provider = provider;
            this.initializeEventListeners();

            return { accounts, chainId };
          } else if (!authFlow.connection || authFlow.connection === "wc") {
            const willOpenURI = !!authFlow.URI;

            const provider = await EthereumProvider.init({
              projectId: options.wcConfig.projectId,
              metadata: options.wcConfig.metadata,
              chains: [parameters?.chainId ?? options.chain?.id ?? mainnet.id], // TODO should use optionalChains for better multichain compatibility
              showQrModal: !willOpenURI,
              qrModalOptions: {
                desktopWallets: [],
                mobileWallets: [],
                explorerRecommendedWalletIds: [],
                enableExplorer: false,
              },
            });

            if (willOpenURI) {
              // TODO pass the dapp the WC URI and this URL so it can show WC QR and open the URL with a button if this auto-open fails (might be blocked by browser)
              function handleUri(uri: string) {
                const addressAuthenticationURL = new URL(authFlow.URI!);
                addressAuthenticationURL.searchParams.set("domain", domainName!);
                addressAuthenticationURL.searchParams.set("address", domainAddress!);
                addressAuthenticationURL.searchParams.set("wcUri", uri);
                window.open(addressAuthenticationURL, "_blank");
                options.openWCUri?.(uri, domainName, domainAddress!, addressAuthenticationURL.toString());
              }
              provider.on("display_uri", handleUri);
            }

            await provider.connect();

            const accounts = provider.accounts as Address[];
            if (!accounts.includes(domainAddress as Address)) {
              provider.disconnect().catch(console.error);
              throw new Error("Remote provider does not have the domain address");
            }
            const chainId = provider.chainId;
            this.wcProvider = provider;
            this.provider = provider as EIP1193Provider;
            this.initializeEventListeners();

            return { accounts, chainId };
          } else {
            throw new Error("Unsupported auth method");
          }

        } catch (error) {
          if (
            /(user rejected|connection request reset)/i.test(
              (error as ProviderRpcError)?.message,
            )
          ) {
            throw new UserRejectedRequestError(error as Error)
          }
          throw error
        } finally {
          options.toggleLoading?.();
        }
      },
      async disconnect() {
        if (!this.provider) {
          return;
        }

        if (this.boundOnAccountsChanged) this.provider.removeListener("accountsChanged", this.boundOnAccountsChanged);
        if (this.boundOnChainChanged) this.provider.removeListener("chainChanged", this.boundOnChainChanged);
        if (this.boundOnConnect) this.provider.removeListener("connect", this.boundOnConnect);
        if (this.boundOnDisconnect) this.provider.removeListener("disconnect", this.boundOnDisconnect);
        if (this.boundOnMessage) this.provider.removeListener("message", this.boundOnMessage);

        this.boundOnAccountsChanged = undefined;
        this.boundOnChainChanged = undefined;
        this.boundOnConnect = undefined;
        this.boundOnDisconnect = undefined;
        this.boundOnMessage = undefined;

        try {
          // this.provider?.request({ method: "wallet_revokePermissions" });
          this.wcProvider?.disconnect();
        } catch (error) {
          console.error(error);
        } finally {
          this.wcProvider = undefined;
          this.provider = undefined;
        }

        options.reloadOnDisconnect && this.connect({ chainId: options.chain?.id }).catch(console.error);
      },
      async getAccounts() {
        if (!this.provider) {
          throw new Error("Provider not connected");
        }

        return this.provider.request({ method: "eth_accounts" });
      },
      async getChainId() {
        if (!this.provider) {
          throw new Error("Provider not connected");
        }

        return this.provider.request({ method: "eth_chainId" });
      },
      async getProvider() {
        if (!this.provider) {
          throw new Error("Provider not connected");
        }

        return this.provider;
      },
      async isAuthorized() {
        if (!this.provider) {
          return false;
        }

        try {
          await this.provider.request({ method: "eth_accounts" });
          return true;
        } catch (error) {
          return false;
        }
      },
      async switchChain(parameters) {
        const normalizedId = Number(parameters.chainId);
        const chain = config.chains.find((c) => c.id === normalizedId);
        if (!chain) {
          throw new Error("Unsupported chain");
        }

        return chain;
      },
      onAccountsChanged(accounts) {
        if (accounts.length === 0) this.onDisconnect()
        else
          config.emitter.emit('change', {
            accounts: accounts.map((x) => getAddress(x)),
          })
      },
      onChainChanged(chain) {
        const chainId = Number(chain)
        config.emitter.emit("change", { chainId });
      },
      onConnect(connectInfo: ProviderConnectInfo) {
        console.log("Connected to provider", connectInfo);
      },
      onDisconnect(error) {
        if (error) console.error(error);

        config.emitter.emit("disconnect");
        this.disconnect().catch(console.error);
      },
      onMessage(message: ProviderMessage) {
        console.log("Message from provider", message);
      },
      initializeEventListeners() {
        if (!this.provider) {
          throw new Error("Must connect provider before initializing event listeners");
        }

        this.boundOnAccountsChanged = this.onAccountsChanged.bind(this);
        this.boundOnChainChanged = this.onChainChanged.bind(this);
        this.boundOnConnect = this.onConnect.bind(this);
        this.boundOnDisconnect = this.onDisconnect.bind(this);
        this.boundOnMessage = this.onMessage.bind(this);

        this.provider.on("accountsChanged", this.boundOnAccountsChanged);
        this.provider.on("chainChanged", this.boundOnChainChanged);
        this.provider.on("connect", this.boundOnConnect);
        this.provider.on("disconnect", this.boundOnDisconnect);
        this.provider.on("message", this.boundOnMessage);
      },
    }

    return connector;
  });
}
