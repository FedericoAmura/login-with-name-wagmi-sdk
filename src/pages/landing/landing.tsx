import { Link } from "react-router-dom";

import "./landing.css";

export interface LandingProps {}

export function Landing({}: LandingProps) {
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

            <p>Getting a wallet that is already named and integrated. This is the ideal option for dApp users.
            <br />You can get a <a href="https://domainwallet.id" target="_blank">Domain Wallet</a>, they are already named and integrated into this demo</p>
            <Link to={'/domainWallet'}>
              <button>
                <img src="/key.png" alt="Login With Name" />
                Create Domain Wallet
              </button>
            </Link>
            <p style={{ color: "red" }}>Warning: <a href="https://domainwallet.id" target="_blank">Domain Wallet</a> is currently in beta and should only be used for testing purposes</p>
          </div>

          <div className="registration-option">
            <h3>Advanced route</h3>

            <p>Setting up the config for your own wallets. This is the path that wallet and dApp developers have to follow.
            <br />We will guide you setting up the authentication flows config and name resolver</p>
            <div>
            {/*<Link to={'/registerName'}>*/}
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
        <p>Click the button below to check your balance and sign messages</p>
        <Link to={'/home'}>
          <button>
            <img src="/loginWithName.png" alt="Login With Name" />
            Get into dApp
          </button>
        </Link>
      </div>

      <div className="step-done">
        <p>
          That's all! After registering you will be able to log in any <span>Login with Name</span> integrated dApp.<br />
          Not just this one, as long as other dApps integrate the same name resolvers you can use your name to log in.
        </p>
        <p>No more remembering complex addresses, or where you have their keys. Just your name ✨</p>
      </div>
    </div>
  );
}
