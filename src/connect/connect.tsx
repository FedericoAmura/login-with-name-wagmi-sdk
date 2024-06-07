import { type Dispatch, type SetStateAction, useState } from "react";

import "./connect.css";
import { showLoading } from "../loading";
import { type WCConnectionData } from "../../lib/loginWithName";

let setConnectionPropsState: Dispatch<SetStateAction<WCConnectionData | undefined>>;

export function toggleWCUri(wcConnectionData: WCConnectionData | undefined) {
  showLoading(); // Remove loading modal if it's open
  setConnectionPropsState(wcConnectionData);
}

interface ConnectProps {}

export function Connect({}: ConnectProps) {
  const [connectionProps, setConnectionProps] = useState<WCConnectionData | undefined>();
  setConnectionPropsState = setConnectionProps;

  if (!connectionProps) {
    return null;
  }

  const { address, domainName, walletUri, wcUri } = connectionProps;

  return (
    <div className="modal" id="modal-connect">
      <div className="modal__overlay" tabIndex={-1}>
        <div className="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-loading-title">
          <h1 className="modal__title" id="modal-loading-title">{domainName}</h1>
          <p className="modal__content">Address: {address}</p>

          <p>Or scan with a Wallet Connect compatible wallet:</p>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(wcUri)}`} alt="QR Code" />

          {connectionProps.walletUri && (
            <p>If the wallet website does not open, click <a href={walletUri} target="_blank">here</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
