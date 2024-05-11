import { type Dispatch, type SetStateAction, useState } from "react";
import type { Address } from "viem";

import "./connect.css";
import { showLoading } from "../loading";

let setConnectionPropsState: Dispatch<SetStateAction<ConnectionProps | undefined>>;

export function showConnect(wcUri: string, domainName: string, address: Address, walletUri?: string) {
  showLoading(); // Remove loading modal if it's open
  setConnectionPropsState({
    wcUri,
    domainName,
    address,
    walletUri,
  });
}

interface ConnectionProps {
  wcUri: string;
  domainName: string;
  address: Address;
  walletUri?: string;
}

interface ConnectProps {}

export function Connect({}: ConnectProps) {
  const [connectionProps, setConnectionProps] = useState<ConnectionProps | undefined>();
  setConnectionPropsState = setConnectionProps;

  if (!connectionProps) {
    return null;
  }

  return (
    <div className="modal" id="modal-connect">
      <div className="modal__overlay" tabIndex={-1}>
        <div className="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-loading-title">
          <h1 className="modal__title" id="modal-loading-title">{connectionProps.domainName}</h1>
          <p className="modal__content">Address: {connectionProps.address}</p>

          <p>Or scan with a Wallet Connect compatible wallet:</p>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${connectionProps.wcUri}`} alt="QR Code" />

          {connectionProps.walletUri && (
            <p>If the wallet website does not open, click <a href={connectionProps.walletUri} target="_blank">here</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
