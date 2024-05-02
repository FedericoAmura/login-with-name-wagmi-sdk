import { type Address } from "viem";

import { ENS, type ENSOptions } from "./ENS";
import { LitId, type LitIdOptions } from "./LitId";
import { type NameResolver } from "./NameResolver";

export interface LitIdENSOptions extends LitIdOptions, ENSOptions {}

export class LitIdENS implements NameResolver {
  private readonly litId: LitId;
  private readonly ens: ENS;

  constructor(options: LitIdENSOptions) {
    this.litId = new LitId(options);
    this.ens = new ENS(options);
  }

  async resolveName(name: string): Promise<Address | null> {
    return await this.litId.resolveName(name) ?? await this.ens.resolveName(name);
  }

  async resolveAuthenticator(name: string): Promise<string | null> {
    const litIdResolves = await this.litId.resolveName(name);
    if (!!litIdResolves) {
      return this.litId.resolveAuthenticator(name);
    }
    return this.ens.resolveAuthenticator(name);
  }

}
