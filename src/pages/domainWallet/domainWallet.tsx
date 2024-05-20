import { useState } from "react";
import { DWR } from "@lit-protocol/domainwallet-sdk";

import "./domainWallet.css";
import useNavigation from "../../hooks/useNavigation";

export interface DomainWalletProps {}

export function DomainWallet({}: DomainWalletProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [validation, setValidation] = useState<"success" | "error" | null>(null);
  const { goToRoot } = useNavigation();

  const openDomainWallets = () => {
    window.open("https://domainwallet.id", "_blank");
  }

  const validateName = async (event: any) => {
    try {
      setLoading(true);

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
    } catch (error) {
      console.error(error);
      setValidation("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="centered-column">
      <h1>Create your <a href="https://domainwallet.id" target="_blank">Domain Wallet</a></h1>

      <div>
        <h3>1. Go to <a href="https://domainwallet.id" target="_blank">domainwallet.id</a> and create your wallet there
        </h3>
        <p>Once that is created we can validate below if it can be found using just your domain</p>
        <button onClick={openDomainWallets}>Open domainwallet.id</button>
        <p style={{ color: 'red' }}>
          <span>Remember</span>
          {' '}<a href="https://domainwallet.id" target="_blank">Domain Wallet</a>
          {' '}is on beta, don't use that wallet for anything important.
        </p>
      </div>

      <div>
        <h3>2. Validate it can be found (optional)</h3>
        <p>Once you have your Domain Wallet, enter its full domain here and validate we can find it</p>
        <form className="centered-column" onSubmit={validateName}>
          <input
            style={{ maxWidth: "300px" }}
            type="text"
            placeholder="vitalik.domainwallet.id"
            value={name}
            onChange={(e) => {
              setValidation(null);
              setName(e.target.value);
            }}
          />
          <button disabled={loading} style={{ marginTop: "24px" }}
                  type="submit">{loading ? "Looking..." : "Find Domain Wallet"}</button>
        </form>
        {validation === "success" && <p>Your wallet is accessible! You are ready to continue ✅</p>}
        {validation === "error" && <p>We could not find your wallet. Did you create it already? 🕵</p>}
      </div>

      <p style={{ marginTop: "32px" }}>Once you have your Domain Wallet, you can go back and log in with it using just
        its domain.</p>
      <button onClick={() => goToRoot()}>Back</button>
    </div>
  );
}
