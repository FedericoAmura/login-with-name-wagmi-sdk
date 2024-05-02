import { Link } from 'react-router-dom';
import { useConnect } from "wagmi";

import "./landing.css";
import useNavigation from "../../hooks/useNavigation";

export interface LandingProps {}

export function Landing({}: LandingProps) {
  const { connectors, connect, status, error } = useConnect();
  const { goToHome } = useNavigation();
  const loginWithNameConnector = connectors.find((c) => c.id === 'loginWithName')!;

  return (
    <div>
      <h1>Login with Name CAIP demo</h1>
      <h2>Find your wallet using just your name 🔥</h2>

      <div className="step-register">
        <h3>1. Name your wallet or get a named one 🗒</h3>
        <p>
          This step can be done two ways.<br />
          We can take the simple option, which is getting a wallet that is already named and integrated.<br />
          Or we can configure all the necessary components and use your own wallet.<br />
          You will have to do this only once.
        </p>

        <div className="registration-routes">
          <div className="registration-option">
            <h3>Easy route</h3>

            <p>Getting a wallet that is already named and integrated. The ideal option for users.</p>
            <p>You can get a <a href={import.meta.env.VITE_LIT_ID_URL} target="_blank">Lit.id</a> wallet, they are already named and integrated into this demo</p>
            <Link to={'/litid'}>
              <button>
                <img src="/key.png" alt="Login With Name" />
                Create LitId wallet
              </button>
            </Link>
            <p style={{ color: "red" }}>Warning: <a href={import.meta.env.VITE_LIT_ID_URL} target="_blank">Lit.id</a> is currently in beta and should only be used for testing purposes</p>
          </div>

          <div className="registration-option">
            <h3>Advanced route</h3>

            <p>Setting up the config for your own wallets. The path that wallet and dApp devs have to follow.</p>
            <p>We will guide you setting up the authentication flows config and name resolver</p>
            <div>
            {/*<Link to={'/register'}>*/}
              <button>
                <img src="/key.png" alt="Login With Name" />
                Register wallet (Coming soon)
              </button>
            {/*</Link>*/}
            </div>
          </div>
        </div>
      </div>

      <div className="step-login">
        <h3>2. Then we will find your wallet on any integrated name resolvers just with your name 🚀</h3>
        <p>Click the button below to authenticate and log in just with your name</p>
        <button onClick={() => connect({ connector: loginWithNameConnector }, { onSuccess: goToHome })}>
          <img src="/loginWithName.png" alt="Login With Name" />
          Login With Name
        </button>
      </div>

      <div className="step-done">
        <p>
          That's all! After registering you will be able to log in any <span>Login with Name</span> integrated dApp.<br />
          Not just this one, as long as other dApps integrate the same name resolvers you can use your name to log in.
        </p>
        <p>No more remembering complex addresses, or where you have their keys</p>
      </div>
    </div>
  );
}
