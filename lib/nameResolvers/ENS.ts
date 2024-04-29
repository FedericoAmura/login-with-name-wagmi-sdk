import { type Address, type Chain, createPublicClient, http, type PublicClient } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";

import { type NameResolver } from "./NameResolver";

export interface ENSOptions {
  chain?: Chain;
  jsonRpcUrl?: string;
}

export class ENS implements NameResolver {
  private readonly client: PublicClient;

  constructor(options: ENSOptions) {
    this.client = createPublicClient({
      chain: options.chain ?? mainnet,
      transport: http(options.jsonRpcUrl),
    });
  }

  async resolveName(domainName: string): Promise<Address | null> {
    return this.client.getEnsAddress({
      name: normalize(domainName),
    });
  }

  async resolveKey(domainName: string, key: string): Promise<string | null> {
    return this.client.getEnsText({
      name: normalize(domainName),
      key,
    });
  }

  async resolveAuthenticator(domainName: string): Promise<string | null> {
    return this.resolveKey(domainName, "authenticator");
  }
}
