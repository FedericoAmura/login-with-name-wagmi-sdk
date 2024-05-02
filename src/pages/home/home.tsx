import {
  useAccount,
  useBalance,
  useDisconnect,
  useEnsName,
} from "wagmi";

import "./home.css";
import { Signing } from "./signing";
import useNavigation from "../../hooks/useNavigation";

export interface HomeProps {}

export function Home({}: HomeProps) {
  const account = useAccount();
  const { goToRoot } = useNavigation();
  const { disconnect } = useDisconnect();
  const balance = useBalance({
    address: account.addresses?.[0],
  });
  const ensName = useEnsName({
    address: account.addresses?.[0],
  });

  return (
    <div className="home">
      <h2>Your account 🔗</h2>

      <div>
        <p><span>Status:</span> {account.status}</p>
        <p><span>Addresses:</span> {JSON.stringify(account.addresses)}</p>
        <p><span>Balance:</span> {Number(balance.data?.formatted) || 0} {balance.data?.symbol}</p>
        <p><span>Chain Id:</span> {account.chainId}</p>
        {ensName.data && <p><span>ENS Name:</span> {ensName.data}</p>}
      </div>

      <Signing />

      <button type="button" style={{ marginTop: "20px" }} onClick={() => disconnect(undefined, { onSuccess: goToRoot })}>
        🔌 Disconnect
      </button>
    </div>
  );
}
