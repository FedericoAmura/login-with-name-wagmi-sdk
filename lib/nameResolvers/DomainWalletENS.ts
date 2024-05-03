import { type Address } from "viem";

import { ENS, type ENSOptions } from "./ENS";
import { DomainWallet, type DomainWalletOptions } from "./DomainWallet";
import { type NameResolver } from "./NameResolver";

export interface DomainWalletENSOptions extends DomainWalletOptions, ENSOptions {}

export class DomainWalletENS implements NameResolver {
  private readonly domainWallet: DomainWallet;
  private readonly ens: ENS;

  constructor(options: DomainWalletENSOptions) {
    this.domainWallet = new DomainWallet(options);
    this.ens = new ENS(options);
  }

  async resolveName(name: string): Promise<Address | null> {
    return await this.domainWallet.resolveName(name) ?? await this.ens.resolveName(name);
  }

  async resolveAuthenticator(name: string): Promise<string | null> {
    const domainWalletResolves = await this.domainWallet.resolveName(name);
    if (!!domainWalletResolves) {
      return this.domainWallet.resolveAuthenticator(name);
    }
    return this.ens.resolveAuthenticator(name);
  }

}
