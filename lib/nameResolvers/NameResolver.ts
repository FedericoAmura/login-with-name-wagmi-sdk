import { type Address } from "viem";

export interface NameResolver {
  resolveName(name: string): Promise<Address | null>;
  resolveAuthenticator(name: string): Promise<string | null>;
}
