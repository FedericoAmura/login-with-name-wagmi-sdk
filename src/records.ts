import { Address } from "viem";

import {
  type AuthFlow,
  Connection,
  Platform,
} from "../lib/loginWithName";

export interface Record {
  address: Address;
  authFlows: AuthFlow[];
}

export const records: Record[] = [
  {
    address: "0x465F178d79044BBd7e222A79fc0147893aE23Ff2",
    authFlows: [
      {
        // Wallet should be in an extension at this browser
        platform: Platform.BROWSER,
        connection: Connection.EXTENSION,
        URI: "injected",
      },
      {
        // Wallet is somewhere else, likely on user phone. Offer WC QR code as generic solution
        connection: Connection.WC,
      },
    ],
  },
  {
    address: "0x331Fe6b8702738A86894A7f8fe7b28bEcF4ff528",
    authFlows: [
      {
        // Wallet is somewhere else, likely on user phone. Offer WC QR code as generic solution
        connection: Connection.WC,
      },
    ]
  },
  {
    address: "0xfd56744c5ff2cb955eaAe52330Ae6769c4Ded5F1",
    authFlows: [
      {
        connection: Connection.WC,
        URI: "http://localhost:3000/wallet",
      },
    ],
  },
  {
    address: "0xb7E455Da04309A5D4b8E2b34aD0cc6B28dAD8C69",
    authFlows: [
      {
        connection: Connection.WC,
        URI: "http://localhost:3000/wallet",
      },
    ],
  },
]
