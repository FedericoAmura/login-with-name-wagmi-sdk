import { DWR } from "@lit-protocol/domainwallet-sdk";
import { type Address } from "viem";

import { type NameResolver } from "./NameResolver";

export interface DomainWalletOptions {
  litNetwork: "cayenne" | "manzano" | "habanero";
}

export class DomainWallet implements NameResolver {
  private readonly dwr: DWR;

  constructor(options: DomainWalletOptions) {
    this.dwr = new DWR({
      litNetwork: options.litNetwork,
    });
  }

  async resolveName(domainName: string): Promise<Address | null> {
    await this.dwr.connect()
    const accountInfo = await this.dwr.getAccountInfo(domainName);
    if (accountInfo) {
      return accountInfo.pkpEthAddress as Address;
    }
    return null;
  }

  async resolveAuthenticator(domainName: string): Promise<string | null> {
    const domainAddress = await this.resolveName(domainName);
    if (domainAddress) {
      return JSON.stringify({
        address: domainAddress,
        authFlows: [{ URI: "https://domainwallet.id/wallet"}],
      });
    }
    return null;
  }
}
