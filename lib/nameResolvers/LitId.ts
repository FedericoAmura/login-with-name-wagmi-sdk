import { type Address } from "viem";
// import { DWR } from "@lit-protocol/domainwallet-sdk"; // TODO We need version 0.1.0 published

import { type NameResolver } from "./NameResolver";

export interface LitIdProps {
  litNetwork: "cayenne" | "manzano" | "habanero";
}

export class LitId implements NameResolver {
  // private readonly dwr: DWR;

  constructor(options: LitIdProps) {
    // this.dwr = new DWR(options.litNetwork);
  }

  async resolveName(domainName: string): Promise<Address | null> {
    // await this.dwr.connect()
    // const accountInfo = await this.dwr.getAccountInfo(domainName);
    // if (accountInfo) {
    //   return accountInfo.pkpEthAddress as Address;
    // }
    return null;
  }

  async resolveAuthenticator(domainName: string): Promise<string | null> {
    return "http://localhost:3001/auth";
  }
}
