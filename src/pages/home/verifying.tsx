import { type Hex } from "viem";
import { useVerifyMessage } from "wagmi";

export interface VerifyingProps {
  message: string;
  signature: Hex;
}

export function Verifying({ message, signature }: VerifyingProps) {
  const verification = useVerifyMessage({
    message,
    signature,
  });

  return (
    <>
      {verification ? <p><span>Message verified! 🎉</span></p> : <p>Message not verified ❌</p>}
    </>
  );
}
