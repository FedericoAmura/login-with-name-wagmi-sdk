import { type Dispatch, type SetStateAction, useState } from "react";

import "./inputName.css";

let setVisibleState: Dispatch<SetStateAction<boolean>>;
let namePromiseResolver: (name: string) => void;
let namePromiseRejecter: (error: Error) => void;

export async function requestName(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    namePromiseResolver = resolve;
    namePromiseRejecter = reject;
    setVisibleState(true);
  });
}

export interface InputNameProps {}

export function InputName({}: InputNameProps) {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  setVisibleState = setVisible;

  const submitName = () => {
    setVisible(false);
    if (name) {
      namePromiseResolver(name);
    }
  }

  const cancel = () => {
    setVisible(false);
    namePromiseRejecter(new Error("User canceled entering a name"));
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="modal" id="modal-name">
      <div className="modal__overlay" tabIndex={-1}>
        <div className="modal__container" role="dialog" aria-modal="true" aria-labelledby="modal-name-title">
          <h1 className="modal__title" id="modal-name-title">What is your Name? 👀</h1>
          <form onSubmit={submitName}>
            <input className="modal__content" id="modal-name-content" type="text" placeholder="Ex. vitalik.eth" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="modal__lower">
              <button type="button" style={{ backgroundColor: "lightpink" }} onClick={() => cancel()}>Cancel</button>
              <button type="submit" style={{ backgroundColor: "lightgreen" }}>Submit</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
