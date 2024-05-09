import React, { useState } from "react";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { normalize } from "viem/ens";

import "./registerName.css";
import useNavigation from "../../hooks/useNavigation";

export interface RegisterProps {}

export function RegisterName({}: RegisterProps) {
  const [name, setName] = useState<string>("");
  const [validation, setValidation] = useState<"success" | "error" | string>("");
  const { goToRegisterAuthFlows, goToRoot } = useNavigation();

  const openENS = () => {
    window.open("https://app.ens.domains/", "_blank");
  }

  const validateName = async (event: any) => {
    event.preventDefault();
    setValidation("");

    if (!name) {
      setValidation("error");
      return;
    }

    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http()
    });

    const ensAddress = await publicClient.getEnsAddress({
      name: normalize(name),
    });

    if (ensAddress) {
      setValidation(ensAddress);
    } else {
      setValidation("error");
    }
  }

  return (
    <div>
      <h1>Link your wallet address to a name</h1>

      <div>
        <p>
          First step is to link your public name with the address that you want to log in with<br />
          Any naming system that has a <a
          href="https://github.com/FedericoAmura/login-with-name-wagmi-sdk/tree/main/lib/nameResolvers"
          target="_blank">NameResolver</a> in the connector will work<br />
          For simplicity, and because several projects integrate with it, in this demo we will use ENS<br />
        </p>
        <h3>1. Go to <a href="https://app.ens.domains/" target="_blank">ENS</a> and register your name</h3>
        <p>Once your name is registered and linked to your address we can validate below if it can be correctly
          resolved</p>
        <button onClick={openENS}>Open ENS</button>
        <p style={{ color: 'red' }}>
          <span>Note</span>
          {' '}this demo uses Sepolia network, you will have to use it in ENS too or we won't be able to find it.
        </p>
      </div>

      <div>
        <h3>2. Validate it can be found (optional)</h3>
        <p>Once you have registered your ENS name, enter it here and validate if we can find it</p>
        <form className="validation-form" onSubmit={validateName}>
          <input
            type="text"
            placeholder="vitalik.eth"
            value={name}
            onChange={(e) => {
              setValidation("");
              setName(e.target.value);
            }}
          />
          <button style={{ marginTop: "24px" }} type="submit">Check name</button>
        </form>
        {(validation && validation !== "error") && (
          <p>Your name is linked to address {validation}! You are ready to continue ✅</p>
        )}
        {validation === 'error' && (
          <p>
            We could not find your name. Did you create it already? Remember it has to be linked in ENS with Sepolia network 🕵
          </p>
        )}
      </div>

      <p style={{ marginTop: '32px' }}>
        Once you have your name registered, we can continue setting up your authentication flows.
      </p>

      <div className="button-bar" style={{ marginTop: "64px" }}>
        <button onClick={() => goToRoot()}>Back</button>
        <button onClick={() => goToRegisterAuthFlows()}>Continue to Auth Flows</button>
      </div>
    </div>
  );
}
