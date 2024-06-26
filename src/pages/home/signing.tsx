import { CircularProgress } from "@mui/joy";
import { useState } from "react";
import { useSignMessage } from "wagmi";

import { Verifying } from "./verifying";

export interface SigningProps {}

export function Signing({}: SigningProps) {
  const [message, setMessage] = useState("");
  const { signMessage, data, isPending } = useSignMessage();

  const submitMessage = async (event: any) => {
    event.preventDefault();
    signMessage({
      message,
    });
  }

  return (
    <div style={{ maxWidth: "800px" }}>
      <form onSubmit={submitMessage}>
        <input type="text" placeholder="Message to sign" value={message} onChange={(e) => setMessage(e.target.value)} />
        <button type="submit" style={{ backgroundColor: "lightgreen", marginTop: "20px", minWidth: "240px" }} disabled={isPending}>
          { isPending? <CircularProgress size="sm" /> : "Sign message" }
        </button>
      </form>
      {data && (
        <>
          <p><span>Signed message:</span></p>
          <p style={{ overflow: "auto" }}>{data}</p>
          <Verifying message={message} signature={data} />
        </>
      )}
    </div>
  );
}
