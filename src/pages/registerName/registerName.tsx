import React, { useState } from "react";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { normalize } from "viem/ens";

import "./registerName.css";
import useNavigation from "../../hooks/useNavigation";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

export interface RegisterProps {}

export function RegisterName({}: RegisterProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [validation, setValidation] = useState<"error" | string>("");
  const { goToRegisterAuthFlows, goToRoot } = useNavigation();

  const openENS = () => {
    window.open("https://app.ens.domains/", "_blank");
  }

  const validateName = async (event: any) => {
    try {
      setLoading(true);

      event.preventDefault();
      setValidation("");

      if (!name) {
        setValidation("error");
        return;
      }

      const ensAddress = await publicClient.getEnsAddress({
        name: normalize(name),
      });

      if (ensAddress) {
        setValidation(ensAddress);
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
      <h1>Get an ENS name to find your wallet config</h1>

      <div>
        <p>
          First step is to get an ENS name to store and find our authentication data<br />
          Any naming system that has a <a
          href="https://github.com/FedericoAmura/login-with-name-wagmi-sdk/tree/main/lib/nameResolvers"
          target="_blank">NameResolver</a> in the connector will work<br />
          For simplicity, and because a lot of projects already integrate with it, in this demo we use ENS Sepolia<br />
          The dApp can define their own name resolver so it can be used with any naming system such as social networks, or private naming systems<br />
        </p>
        <h3>1. Go to <a href="https://app.ens.domains/" target="_blank">ENS</a> and register your name</h3>
        <p>
          Register a name first<br />
          There is no need to repeat this step if you already have one on Sepolia<br />
        </p>
        <button onClick={openENS}>Open ENS</button>
        <p style={{ color: 'red' }}>
          <span>Note:</span>
          {' '}this demo uses Sepolia network, you will have to use it in ENS too or we won't be able to find it.
        </p>
      </div>

      <div>
        <h3>2. Validate it can be found (optional)</h3>
        <p>Once you have registered your ENS name, enter it here and validate if we can find it</p>
        <form className="centered-column" onSubmit={validateName}>
          <input
            style={{ maxWidth: "300px" }}
            type="text"
            placeholder="vitalik.eth"
            value={name}
            onChange={(e) => {
              setValidation("");
              setName(e.target.value);
            }}
          />
          <button disabled={loading} style={{ marginTop: "24px" }} type="submit">{loading ? "Looking..." : "Find name"}</button>
        </form>
        {(validation && validation !== "error") && (
          <p>
            Your name is linked to address {validation}!<br />
            You are ready to continue ✅
          </p>
        )}
        {validation === 'error' && (
          <p>
            We could not find your name. Did you create it already?<br />
            Remember it has to be linked in ENS with Sepolia network 🕵
          </p>
        )}
      </div>

      <p style={{ marginTop: '32px' }}>
        Once you have your name registered and can be found, we can continue setting up your authentication flows.
      </p>

      <div className="button-bar" style={{ marginTop: "64px" }}>
        <button onClick={() => goToRoot()}>Go to Home</button>
        <button onClick={() => goToRegisterAuthFlows(validation !== "error" ? name : undefined)}>Continue to Auth Flows</button>
      </div>
    </div>
  );
}
