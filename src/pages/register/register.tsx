import React, { useState } from "react";
import Box from "@mui/joy/Box";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import Stack from "@mui/joy/Stack";
import Textarea from "@mui/joy/Textarea";
import Tooltip from "@mui/joy/Tooltip";
import Typography from "@mui/joy/Typography";
import { Link } from 'react-router-dom';

import "./register.css";
import { type AuthFlow, Connection, Platform } from "../../../lib/loginWithName";

export interface RegisterProps {}

export function Register({}: RegisterProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [authFlows, setAuthFlows] = useState<AuthFlow[]>([{ connection: Connection.WC }]);
  const [error, setError] = useState<Error | null>(null);

  const addAuthFlow = async (event: any) => {
    event.preventDefault();
    setAuthFlows([...authFlows, { connection: Connection.WC }]);
  };

  const removeAuthFlow = async (event: any) => {
    event.preventDefault();
    if (authFlows.length === 1) {
      setAuthFlows([{ connection: Connection.WC }]);
    } else {
      setAuthFlows(authFlows.slice(0, authFlows.length - 1));
    }
  };

  const submit = async (event: any) => {
    event.preventDefault();
    alert("Registering...");
    try {
      const response = await fetch(`${import.meta.env.VITE_AUTHENTICATOR_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address, authFlows }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      alert("Success! Now you can go back, link your name and authenticator in ENS and start using your name to log in!");
    } catch (error) {
      console.error("Error:", error);
      setError(error as Error);
    }
  };

  return (
    <div className="register">
      <Typography
        sx={{ color: "white" }}
        level="h2"
        variant="plain"
      >
        Register your name authenticator flows
      </Typography>

      <form onSubmit={submit}>
        <Stack
          className="auth-flow-stack"
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={0}
        >
          <Box className="auth-flow-address">
            <Typography
              sx={{ color: "white" }}
              level="h3"
              variant="plain"
            >
              Wallet:
            </Typography>
            <Tooltip
              arrow
              placement="top"
              variant="outlined"
              title="The wallet dApp will try to connect with the auth flows"
            >
              <Textarea
                className="auth-flow-param-input"
                style={{ marginLeft: "16px" }}
                disabled={false}
                maxRows={1}
                size="md"
                variant="outlined"
                placeholder="0x..."
                value={address || ""}
                onChange={(event) => setAddress(event.target.value || null)}
              />
            </Tooltip>
          </Box>
          {authFlows.map((flow, i) => (
            <Box key={i} className="auth-flow">
              <Typography
                sx={{ color: "white" }}
                level="h2"
                variant="plain"
              >
                Authenticator Flow {i + 1}
              </Typography>

              <Box className="auth-flow-config">
                <Box sx={{ width: "250px" }} className="auth-flow-param-config">
                  <Typography
                    sx={{ color: "white" }}
                    level="h3"
                    variant="plain"
                  >
                    Platform:
                  </Typography>
                  <Tooltip
                    arrow
                    placement="top"
                    variant="outlined"
                    title="The platform where this auth flow will be valid"
                  >
                    <Select
                      className="auth-flow-param-select"
                      placeholder="Platform"
                      size="md"
                      variant="outlined"
                      value={flow.platform}
                      onChange={(value, newValue: Platform | null) => {
                        const newFlows = [...authFlows];
                        const flow = newFlows[i]!;
                        if (newValue !== Platform.MOBILE && flow.connection === Connection.MWP) {
                          flow.connection = Connection.WC;
                        }
                        newFlows[i] = { ...flow, platform: newValue || undefined };
                        setAuthFlows(newFlows);
                      }}
                    >
                      <Option value={null}>Everywhere</Option>
                      <Option value={Platform.BROWSER}>Browser</Option>
                      <Option value={Platform.MOBILE} disabled={true}>Mobile (coming soon)</Option>
                    </Select>
                  </Tooltip>
                </Box>

                <Box sx={{ width: "250px" }} className="auth-flow-param-config">
                  <Typography
                    sx={{ color: "white" }}
                    level="h3"
                    variant="plain"
                  >
                    Conn protocol:
                  </Typography>
                  <Tooltip
                    arrow
                    placement="top"
                    variant="outlined"
                    title="The connection protocol to stablish with the wallet"
                  >
                    <Select
                      className="auth-flow-param-select"
                      placeholder="Connection"
                      size="md"
                      variant="outlined"
                      value={flow.connection}
                      onChange={(value, newValue: Connection | null) => {
                        const newFlows = [...authFlows];
                        newFlows[i] = { ...flow, connection: newValue || Connection.WC };
                        setAuthFlows(newFlows);
                      }}
                      required
                    >
                      <Option value={Connection.EXTENSION}>Extension</Option>
                      <Option value={Connection.WC}>WalletConnect</Option>
                      <Option value={Connection.MWP} disabled={flow.platform !== Platform.MOBILE}>Mobile Wallet Protocol</Option>
                    </Select>
                  </Tooltip>
                </Box>

                <Box sx={{ flexGrow: 1 }} className="auth-flow-param-config">
                  <Typography
                    sx={{ color: "white" }}
                    level="h3"
                    variant="plain"
                  >
                    Wallet Location
                  </Typography>
                  <Tooltip
                    arrow
                    placement="top"
                    variant="outlined"
                    title={
                      <Box>
                        <div>The location where the wallet can be found and triggered. For example:</div>
                        <ul>
                          <li>injected (default, for extensions in your browser)</li>
                          <li>io.metamask (EIP-6963 support coming soon)</li>
                          <li>org.toshi (Android+MWP only, APK name)</li>
                          <li>https://lit.id/wallet (for web wallets)</li>
                        </ul>
                      </Box>
                    }
                  >
                    <Textarea
                      className="auth-flow-param-input"
                      disabled={false}
                      maxRows={1}
                      size="md"
                      variant="outlined"
                      placeholder="Wallet location"
                      value={flow.URI}
                      onChange={(event) => {
                        const newFlows = [...authFlows];
                        newFlows[i] = { ...flow, URI: event.target.value || undefined };
                        setAuthFlows(newFlows);
                      }}
                    />
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>

        <div className="button-bar">
          <button type="button" onClick={removeAuthFlow}>-</button>
          <button type="button" onClick={addAuthFlow}>+</button>
        </div>
        <div className="button-bar" style={{ marginTop: "64px" }}>
          <Link to={"/"}>
            <button type="button">Back</button>
          </Link>
          <button type="submit" style={{ backgroundColor: "lightgreen" }}>Register flows</button>
        </div>
      </form>

      <div style={{ marginTop: "64px" }}>{error?.message ? `ERROR: ${error.message}` : ""}</div>
    </div>
  );
}
