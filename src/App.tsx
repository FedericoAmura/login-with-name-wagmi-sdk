import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useEnsName,
} from "wagmi";

import "./App.css";
import Signing from "./Signing";

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const balance = useBalance({
    address: account.addresses?.[0],
  });
  const ensName = useEnsName({
    address: account.addresses?.[0],
  });

  const loginWithNameConnector = connectors.find((c) => c.id === 'loginWithName')!;

  return (
    <div className="App">
      <div>
        {status === 'success' ? (
          <div>
            <h2>Your account 🔗</h2>

            <div>
              <p><span>Status:</span> {account.status}</p>
              <p><span>Addresses:</span> {JSON.stringify(account.addresses)}</p>
              <p><span>Balance:</span> {Number(balance.data?.formatted) || 0} {balance.data?.symbol}</p>
              <p><span>Chain Id:</span> {account.chainId}</p>
              {ensName.data && <p><span>ENS Name:</span> {ensName.data}</p>}
            </div>

            <Signing />

            {account.status === 'connected' && (
              <button type="button" onClick={() => disconnect()}>
                🔌 Disconnect
              </button>
            )}
          </div>
        ) : (
          <div>
            <h2>Connect using just your name 🔥</h2>
            <p>
              We will look for your wallet on several authenticators by just using your name. Click the button below to
              see it in action 🚀
            </p>
            <button onClick={() => connect({ connector: loginWithNameConnector })}>
              <img src="/loginWithName.png" alt="Login With Name" />
              Login With Name
            </button>
            <div>{error?.message}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
