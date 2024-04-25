import { Dispatch, SetStateAction, useState } from "react";

import "./loading.css";
import { Spinner } from "./spinner";
import { LoginWithNameSteps } from "../../lib/loginWithName";

let setTextState: Dispatch<SetStateAction<string | undefined>>;

const loginWithNameStepDescriptions: Record<LoginWithNameSteps, string> = {
  [LoginWithNameSteps.GET_DOMAIN_NAME]: "Getting Domain Name...",
  [LoginWithNameSteps.RESOLVE_DOMAIN_NAME]: "Resolving Domain Name...",
  [LoginWithNameSteps.RESOLVE_AUTHENTICATOR]: "Resolving Authenticator info...",
  [LoginWithNameSteps.TRIGGER_AUTHENTICATION]: "Please authenticate in your wallet and connect back",
};

export function showLoading(loginWithNameStep?: LoginWithNameSteps) {
  if (loginWithNameStep === LoginWithNameSteps.GET_DOMAIN_NAME) {
    // At this step we want the user to see the input name modal, not the loading modal
    setTextState(undefined);
    return;
  }

  const displayText = loginWithNameStep ? loginWithNameStepDescriptions[loginWithNameStep] : undefined;
  setTextState(displayText);
}

interface LoadingProps {
  text?: string;
}

export function Loading({ text }: LoadingProps) {
  const [textState, setText] = useState(text);
  setTextState = setText;

  if (!textState) {
    return null;
  }

  return (
    <div className="modal" id="modal-loading">
      <div className="modal__overlay" tabIndex={-1}>
        <div className="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-loading-title">
          <h1 className="modal__title" id="modal-loading-title">Loading...</h1>
          <p className="modal__content" id="modal-loading-content">{textState}</p>
          <div className="modal__lower">
            <Spinner />
          </div>
        </div>
      </div>
    </div>
  );
}
