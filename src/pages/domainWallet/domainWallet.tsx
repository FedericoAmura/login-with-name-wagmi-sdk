import { useState } from "react";
import { DWR } from "@lit-protocol/domainwallet-sdk";

import "./domainWallet.css";
import useNavigation from "../../hooks/useNavigation";

export interface DomainWalletProps {}

export function DomainWallet({}: DomainWalletProps) {
  const [name, setName] = useState<string>("");
  const [validation, setValidation] = useState<"success" | "error" | null>(null);
  const { goToRoot } = useNavigation();

  const openDomainWallets = () => {
    window.open(import.meta.env.VITE_DOMAIN_WALLET_URL, "_blank");
  }

  const validateName = async (event: any) => {
    event.preventDefault();
    setValidation(null);

    if (!name) {
      setValidation("error");
      return;
    }

    const dwr = new DWR({ litNetwork: import.meta.env.VITE_LIT_NETWORK || "cayenne" });
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
      <h1>Create your <a href={import.meta.env.VITE_DOMAIN_WALLET_URL} target="_blank">Domain Wallet</a> named wallet</h1>

      <div>
        <h3>1. Go to <a href={import.meta.env.VITE_DOMAIN_WALLET_URL} target="_blank">Domain Wallet</a> and create your wallet</h3>
        <p>Once that is created we can validate below if it can be found using just your domain</p>
        <button onClick={openDomainWallets}>Open Domain Wallet</button>
        <p style={{ color: 'red' }}>
          <span>Remember</span>
          {' '}<a href={import.meta.env.VITE_DOMAIN_WALLET_URL} target="_blank">Domain Wallet</a>
          {' '}is on beta, don't use that wallet for anything important.
        </p>
      </div>

      <div>
        <h3>2. Validate it can be found (optional)</h3>
        <p>Once you have your Domain Wallet, enter its full domain here and validate if we can find it</p>
        <form className="validation-form" onSubmit={validateName}>
          <input type="text" placeholder="yourdomain.domainwallet.id" value={name}
                 onChange={(e) => setName(e.target.value)} />
          <button style={{ marginTop: "24px" }} type="submit">Check name</button>
        </form>
        {validation === "success" && <p>Your wallet is accessible! You are ready to continue ✅</p>}
        {validation === "error" && <p>We could not find your wallet. Did you create it already? 🕵</p>}
      </div>

      <p style={{ marginTop: "32px" }}>Once you have your Domain Wallet, you can go back and log in with it using just its domain.</p>
      <button onClick={() => goToRoot()}>Back</button>
    </div>
  );
}
