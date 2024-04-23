import { type Address } from "viem";

export interface NameResolver {
  resolveName(domainName: string): Promise<Address | null>;
  resolveAuthenticator(domainName: string): Promise<string | null>;
}
