import { Link } from "react-router-dom";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useEnsName,
} from "wagmi";

import "./home.css";
import { Signing } from "./signing";

export interface HomeProps {}

export function Home({}: HomeProps) {
  const account = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect, connectors: connectedConnectors } = useDisconnect();
  const balance = useBalance({
    address: account.addresses?.[0],
  });
  const ensName = useEnsName({
    address: account.addresses?.[0],
  });
  const loginWithNameConnector = connectors.find((c) => c.id === "loginWithName")!;

  const disconnectConnectors = () => {
    connectedConnectors.forEach((connector) => {
      disconnect({ connector });
    });
  };

  return (
    <div className="home">

      {account.status === "connected" ? (
        <>
          <h2>Your account 🔗</h2>

          <div>
            <p><span>Status:</span> {account.status}</p>
            <p><span>Addresses:</span> {JSON.stringify(account.addresses)}</p>
            <p><span>Balance:</span> {Number(balance.data?.formatted) || 0} {balance.data?.symbol}</p>
            <p><span>Chain Id:</span> {account.chainId}</p>
            {ensName.data && <p><span>ENS Name:</span> {ensName.data}</p>}
          </div>

          <Signing />

          <button type="button" style={{ marginTop: "20px" }} onClick={disconnectConnectors}>
            🔌 Disconnect
          </button>
        </>
      ) : (
        <>
          <h2>Connect to your wallet</h2>

          <button onClick={() => connect({ connector: loginWithNameConnector })}>
            <img src="/loginWithName.png" alt="Login With Name" />
            Login With Name
          </button>

          <div className="wallet-options">
            <h3>Don't have a login with name linked wallet?</h3>
            <p>Click <Link to={'/domainWallet'}>Here</Link> to get a domain linked wallet ready to use!</p>
            <p>Linking your existing Crypto Domain to a Auth Provider is coming soon</p>
          </div>
        </>
      )}
    </div>
  );
}
