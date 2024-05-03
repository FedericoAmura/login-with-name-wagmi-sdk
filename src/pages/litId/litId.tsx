import { useState } from "react";
import { DWR } from "@lit-protocol/domainwallet-sdk";

import "./litId.css";
import useNavigation from "../../hooks/useNavigation";

export interface LitIdProps {}

export function LitId({}: LitIdProps) {
  const [name, setName] = useState<string>("");
  const [validation, setValidation] = useState<"success" | "error" | null>(null);
  const { goToRoot } = useNavigation();

  const openLitId = () => {
    window.open(import.meta.env.VITE_LIT_ID_URL, "_blank");
  }

  const validateName = async (event: any) => {
    event.preventDefault();
    setValidation(null);

    if (!name) {
      setValidation("error");
      return;
    }

    const dwr = new DWR({ litNetwork: "cayenne" });
    await dwr.connect();

    const accountInfo = await dwr.getAccountInfo(name);
    if (accountInfo) {
      setValidation("success");
    } else {
      setValidation("error");
    }
  }

  return (
    <div>
      <h1>Create your <a href={import.meta.env.VITE_LIT_ID_URL} target="_blank">Lit.id</a> named wallet</h1>

      <div>
        <h3>1. Go to <a href={import.meta.env.VITE_LIT_ID_URL} target="_blank">Lit.id</a> and create your wallet</h3>
        <p>Once that is created we can validate below if it can be found using just your domain</p>
        <button onClick={openLitId}>Open Lit.id</button>
        <p style={{ color: 'red' }}>
          <span>Remember</span>
          {' '}<a href={import.meta.env.VITE_LIT_ID_URL} target="_blank">Lit.id</a>
          {' '}is on beta, don't use that wallet for anything important.
        </p>
      </div>

      <div>
        <h3>2. Validate it can be found (optional)</h3>
        <p>Once you have your Lit.id wallet, enter its full domain here and validate if we can find it</p>
        <form className="validation-form" onSubmit={validateName}>
          <input type="text" placeholder="yourdomain.domainwallet.id" value={name}
                 onChange={(e) => setName(e.target.value)} />
          <button style={{ marginTop: "24px" }} type="submit">Check name</button>
        </form>
        {validation === "success" && <p>Your wallet is accessible! You are ready to continue ✅</p>}
        {validation === "error" && <p>We could not find your wallet. Did you create it already? 🕵</p>}
      </div>

      <p style={{ marginTop: "32px" }}>Once you have your Lit.id wallet, you can go back and log in with it using just its domain.</p>
      <p>(By the way, you should check <a href="https://www.litprotocol.com/" target="_blank">Lit protocol</a> 🐐)</p>
      <button onClick={() => goToRoot()}>Back</button>
    </div>
  );
}
