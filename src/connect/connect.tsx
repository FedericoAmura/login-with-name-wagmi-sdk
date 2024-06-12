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

  const copyWCUri = () => {
    navigator.clipboard.writeText(connectionProps.wcUri);
  }

  const { address, domainName, walletUri, wcUri } = connectionProps;

  return (
    <div className="modal" id="modal-connect">
      <div className="modal__overlay" tabIndex={-1}>
        <div className="centered-column" role="dialog" aria-modal="true" aria-labelledby="modal-loading-title">
          <h1 className="modal__title" id="modal-name-title">Waiting your wallet connection 🔗</h1>

          <h2 className="modal__title" style={{ marginBottom: 0 }} id="modal-loading-title">{domainName}</h2>
          <p className="modal__content" style={{ fontSize: "1em" }}>Address: {address}</p>

          {connectionProps.walletUri && (
            <>
              <p className="no-margin">Your wallet should have opened automatically</p>
              <p className="no-margin">
                If it does not open, click <a href={walletUri} target="_blank">here</a>
              </p>
            </>
          )}
          <p className="no-margin">Or scan and connect with a Wallet Connect compatible wallet:</p>

          <img className="simple-margin"
               src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(wcUri)}`}
               alt="QR Code" />
          <button type="button" onClick={copyWCUri}>Copy WalletConnect URI</button>

        </div>
      </div>
    </div>
  );
}
