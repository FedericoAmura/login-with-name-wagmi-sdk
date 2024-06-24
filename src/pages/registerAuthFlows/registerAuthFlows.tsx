import {
  Autocomplete,
  Box,
  CircularProgress,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
  Stack,
  Textarea,
  Tooltip,
  Typography,
} from "@mui/joy";
import _ from "lodash";
import { createStore } from "mipd";
import React, { useCallback, useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { createPublicClient, http, type EIP1193Provider, type Address } from "viem";
import { sepolia } from "viem/chains";
import { normalize } from "viem/ens";

import "./registerAuthFlows.css";
import useNavigation from "../../hooks/useNavigation";
import { type Authenticator, type AuthFlow, Connection, Platform } from "../../../lib/loginWithName";

const ADDRESS_NOT_FOUND = "0x...";
const PLATFORM_EVERYWHERE = "everywhere";
type EXTENDED_PLATFORM = Platform | typeof PLATFORM_EVERYWHERE;

const eip6963Store = createStore();
const wallets = ["injected", "https://domainwallet.id/wallet", ...eip6963Store.getProviders().map(p => p.info.rdns)];
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

interface PotentialAuthFlow extends Required<Omit<AuthFlow, "platform">> {
  platform: EXTENDED_PLATFORM;
  id: number;
  provider: EIP1193Provider | undefined,
}

function newAuthFlow(id: number): PotentialAuthFlow {
  return {
    id,
    platform: PLATFORM_EVERYWHERE,
    connection: Connection.WC,
    URI: "",
    provider: undefined,
  };
}

interface SelectedChain {
  chainId: string;
  label: string;
}
const EOA_CHAIN = { chainId: "", label: "No chain" };

export interface RegisterProps {}

export function RegisterAuthFlows({}: RegisterProps) {
  const [name, setName] = useState<string>(() => new URLSearchParams(window.location.search).get("name") || "");
  const [address, setAddress] = useState<string>(ADDRESS_NOT_FOUND);
  const [chain, setChain] = useState<SelectedChain | null>(EOA_CHAIN);
  const [authFlows, setAuthFlows] = useState<PotentialAuthFlow[]>([newAuthFlow(0)]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [openENSModal, setOpenENSModal] = useState<boolean>(false);
  const [openSuccessModal, setOpenSuccessModal] = useState<boolean>(false);
  const { goToRoot, goToRegisterName } = useNavigation();

  const resolveName = useCallback(_.debounce(async (name: string) => {
    try {
      setError(null);

      const authenticator = await publicClient.getEnsText({
        name: normalize(name),
        key: "authenticator",
      });
      // domainAuthenticator can be null, a JSON string or a URL with a "{}" as name placeholder
      if (!authenticator) {
        const ensAddress = await publicClient.getEnsAddress({
          name: normalize(name),
        });
        setAddress(ensAddress || ADDRESS_NOT_FOUND);

        return;
      }

      let address: Address;
      let authFlows: AuthFlow[];
      try {
        // First try to resolve the authenticator as a URL
        const authenticatorURL = new URL(authenticator.replace("{}", name));
        authenticatorURL.searchParams.set("name", name); // Optional but an authenticator service might want other query params too
        const response = await fetch(authenticatorURL);
        const { address: resolvedAddress, authFlows: resolvedAuthMethods } = await response.json();
        address = resolvedAddress;
        authFlows = resolvedAuthMethods;
      } catch (error) {
        console.error(error);
        // If that fails, authenticator must be the JSON itself
        const { address: resolvedAddress, authFlows: resolvedAuthMethods } = JSON.parse(authenticator);
        address = resolvedAddress;
        authFlows = resolvedAuthMethods;
      }

      if (!address ||!authFlows) {
        throw new Error("Authenticator likely not saved yet in ENS or it's not a valid JSON or URL.");
      }

      setAddress(address);
      setAuthFlows(authFlows.map((flow, i) => ({
        ...flow,
        id: i,
        platform: flow.platform || PLATFORM_EVERYWHERE,
        provider: undefined,
        URI: flow.URI || "",
      })));
    } catch (error) {
      console.error(error);
      setAddress(ADDRESS_NOT_FOUND);
    }
  }, 500), [setName, setAddress]);
  const updateResolveName = async (name: string | null) => {
    if (!name) {
      setName("");
      setAddress(ADDRESS_NOT_FOUND);
      return;
    }

    const clearedName = name.replace(/\s/g, "");

    setName(clearedName);
    setAddress("Fetching address...");
    resolveName(clearedName);
  }

  const addAuthFlow = async (event: any) => {
    event.preventDefault();
    setError(null);
    setAuthFlows([...authFlows, newAuthFlow(authFlows.length)]);
  };

  const removeAuthFlow = async (event: any) => {
    event.preventDefault();
    setError(null);
    if (authFlows.length === 1) {
      setAuthFlows([newAuthFlow(0)]);
    } else {
      setAuthFlows(authFlows.slice(0, authFlows.length - 1));
    }
  };

  // const testAuthFlow = async (authFlow: PotentialAuthFlow) => {
  //   console.log(authFlow);
  // }

  const submit = async (event: any) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const authenticatorAuthFlows: AuthFlow[] = authFlows.map((af) => ({
        platform: af.platform === PLATFORM_EVERYWHERE ? undefined : af.platform,
        connection: af.connection,
        URI: af.URI ? af.URI : undefined,
      }));

      const requestBody: Authenticator & { name: string } = { address: address as Address, name, authFlows: authenticatorAuthFlows };
      if (chain?.chainId) {
        requestBody.chain = chain.chainId;
      }
      const response = await fetch(`${import.meta.env.VITE_AUTHENTICATOR_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      setOpenSuccessModal(true);
    } catch (error) {
      console.error("Error:", error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const openENS = () => {
    window.open("https://app.ens.domains/", "_blank");
  }

  const copyAuthenticator = () => {
    const ensAuthFlows: AuthFlow[] = authFlows.map((af) => ({
      platform: af.platform === PLATFORM_EVERYWHERE ? undefined : af.platform,
      connection: af.connection,
      URI: af.URI ? af.URI : undefined,
    }));

    const authenticator: Authenticator = {
      address: address as Address,
      authFlows: ensAuthFlows,
    };
    if (chain?.chainId) {
      authenticator.chain = chain.chainId;
    }

    navigator.clipboard.writeText(JSON.stringify(authenticator));
  }

  const copyAuthenticatorURL = () => {
    navigator.clipboard.writeText('https://login-with-name-wagmi-sdk.onrender.com/auth/{}');
  }

  const isAuthenticatorComplete = !!name && address !== ADDRESS_NOT_FOUND && !!authFlows.length;

  useEffect(() => {
    if (name) {
      resolveName(name);
    }
  }, [name]);

  return (
    <div className="register">
      <Typography
        sx={{ color: "white" }}
        level="h2"
        variant="plain"
      >
        Register your name authenticator flows
      </Typography>
      <Typography
        sx={{ color: 'white' }}
        variant="plain"
      >
        After registering your name on Sepolia ENS, you have to define how we are going to find and request authentication for that same wallet<br />
        For that, you will define authentication flows, which will tell the connector where your wallet is accessible and how it has to connect with it<br /><br />
        First enter your Sepolia ENS name to fetch the current configuration<br />
        Then you can configure the authentication flows and store them in Sepolia ENS or an authenticator service that will hold them for you
      </Typography>

      <form onSubmit={submit}>
        <Stack
          className="authenticator-config"
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={0}
        >
          <Box className="authenticator-property">
            <Typography
              sx={{ color: "white" }}
              level="h3"
              variant="plain"
              noWrap
            >
              ENS Name:
            </Typography>
            <Tooltip
              arrow
              placement="top"
              variant="outlined"
              title="The ENS where you will store the authentication config and that dApps will use to authenticate you"
            >
              <Textarea
                className="authenticator-property-input"
                disabled={false}
                required
                maxRows={1}
                size="md"
                variant="outlined"
                placeholder="vitalik.eth"
                value={name || ""}
                onChange={(event) => updateResolveName(event.target.value || null)}
              />
            </Tooltip>
          </Box>
          <Box className="authenticator-property">
            <Typography
              sx={{ color: "white" }}
              level="h3"
              variant="plain"
              noWrap
            >
              Wallet Address:
            </Typography>
            <Tooltip
              arrow
              placement="top"
              variant="outlined"
              title="The wallet you will use to authenticate with dApps. It must be an EOA. Smart wallet support is coming soon."
            >
              <Textarea
                className="authenticator-property-input"
                disabled={false}
                required
                maxRows={1}
                size="md"
                variant="outlined"
                placeholder={ADDRESS_NOT_FOUND}
                value={address || ADDRESS_NOT_FOUND}
                onChange={(event) => setAddress(event.target.value || ADDRESS_NOT_FOUND)}
              />
            </Tooltip>
          </Box>
          <Box className="authenticator-property">
            <Typography
              sx={{ color: "white" }}
              level="h3"
              variant="plain"
              noWrap
            >
              Wallet Chain:
            </Typography>
            <Tooltip
              arrow
              placement="top"
              variant="outlined"
              title="The chain where the wallet is located. Select No Chain if it is an EOA"
            >
              <Autocomplete<{ chainId: string, label: string}>
                className="authenticator-property-input"
                disabled={false}
                size="md"
                variant="outlined"
                placeholder="Chain"
                value={chain}
                onChange={(event, newValue) => {
                  console.log(newValue);
                  setChain(newValue);
                }}
                options={[
                  EOA_CHAIN,
                  { chainId: "eip155:1", label: "Ethereum" },
                  { chainId: "eip155:56", label: "BNB Smart Chain" },
                  { chainId: "eip155:8453", label: "Base" },
                  { chainId: "eip155:137", label: "Polygon" },
                  { chainId: "eip155:42161", label: "Arbitrum One" },
                  { chainId: "eip155:11155111", label: "Ethereum Sepolia" },
                ]}
              />
            </Tooltip>
          </Box>
          <ReactSortable className="auth-flows" list={authFlows} setList={setAuthFlows}>
            {authFlows.map((flow, i) => (
              <Box key={i} className="auth-flow">
                <Box className="auth-flow-header">
                  <Typography
                    sx={{ color: "white" }}
                    level="h3"
                    variant="plain"
                  >
                    Authenticator Flow {i + 1}
                  </Typography>
                  {/*<Box>*/}
                  {/*  <button type="button" onClick={() => testAuthFlow(flow)}>Test</button>*/}
                  {/*</Box>*/}
                </Box>

                <Box className="auth-flow-config">
                  <Box sx={{ width: "250px" }} className="auth-flow-param-config">
                    <Typography
                      sx={{ color: "white" }}
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
                        defaultValue={PLATFORM_EVERYWHERE}
                        value={flow.platform}
                        onChange={(value, newValue) => {
                          const newFlows = [...authFlows];
                          const flow = newFlows[i]!;
                          if (newValue !== Platform.MOBILE && flow.connection === Connection.MWP) {
                            flow.connection = Connection.WC;
                          }
                          newFlows[i] = { ...flow, platform: (newValue || PLATFORM_EVERYWHERE) as EXTENDED_PLATFORM};
                          setAuthFlows(newFlows);
                        }}
                      >
                        <Option value={PLATFORM_EVERYWHERE}>Everywhere</Option>
                        <Option value={Platform.BROWSER}>Browser</Option>
                        <Option value={Platform.MOBILE} disabled={false}>Mobile (coming soon)</Option>
                      </Select>
                    </Tooltip>
                  </Box>

                  <Box sx={{ width: "250px" }} className="auth-flow-param-config">
                    <Typography
                      sx={{ color: "white" }}
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
                          The location where the wallet can be found and triggered. For example:
                          <ul>
                            <li>injected (for any extension in your browser)</li>
                            <li>an EIP-6963 compliant wallet rdns (io.metamask, com.coinbase.wallet, etc.)</li>
                            <li>a mobile app package name (Android+MWP only, org.toshi)</li>
                            <li>https://domainwallet.id/wallet (for web wallets or magic links)</li>
                          </ul>
                          Or you can leave it blank if you just want to use a wallet connect QR code or an injected extension
                        </Box>
                      }
                    >
                      <Autocomplete
                        className="auth-flow-param-input"
                        disabled={false}
                        size="md"
                        variant="outlined"
                        placeholder="Wallet location"
                        value={flow.URI}
                        options={wallets}
                        freeSolo
                      />
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            ))}
          </ReactSortable>
        </Stack>

        <div className="button-bar">
          <button type="button" onClick={removeAuthFlow}>-</button>
          <button type="button" onClick={addAuthFlow}>+</button>
        </div>
        <div className="button-bar" style={{ marginTop: "64px" }}>
          <button type="button" onClick={goToRoot}>Go to Home</button>
          <button type="button" onClick={goToRegisterName}>Back to name</button>
          <button
            type="button"
            disabled={!isAuthenticatorComplete}
            onClick={() => setOpenENSModal(true)}
            style={{ backgroundColor: isAuthenticatorComplete ? "lightgreen" : "lightgray", minWidth: "180px" }}
          >
            Register flows in ENS
          </button>
          <button
            type="button"
            disabled={!isAuthenticatorComplete}
            onClick={(event) => submit(event)}
            style={{ backgroundColor: isAuthenticatorComplete ? "lightgreen" : "lightgray", minWidth: "240px" }}
          >
            {loading ? <CircularProgress size="sm" /> : "Register flows in Authenticator"}
          </button>
        </div>
      </form>

      <div style={{ marginTop: '64px' }}>{error?.message ? `ERROR: ${error.message}` : ""}</div>

      <Modal open={openENSModal} onClose={() => setOpenENSModal(false)}>
        <ModalDialog variant="plain">
          <ModalClose />
          <Typography
            level="h3"
            variant="plain"
            noWrap
          >
            Register Authentication Flows in ENS
          </Typography>
          To save your authentication flows in ENS you have to follow the following steps:<br /><br />
          1. Open ENS.
          <button onClick={openENS} style={{ width: "420px" }}>Open ENS</button>
          2. Search your name to edit a record in it.{name ? ` You used ${name}.` : ""}<br />
          3. Go to the Records option.<br />
          4. Add a Text record with the key "authenticator". Or edit it if it already exists.<br />
          5. Fill the value of the "authenticator" record with the stringified JSON of your authentication flows.<br />
          <button onClick={copyAuthenticator} style={{ width: "420px" }}>Copy authenticator to clipboard</button>
          6. Save confirming the transaction with your wallet.<br />
          7. Done! Your authentication flows are now stored in ENS.<br /><br />

          You can go back Home and log in to the dApp using your name.
        </ModalDialog>
      </Modal>

      <Modal open={openSuccessModal} onClose={() => setOpenSuccessModal(false)}>
        <ModalDialog variant="plain">
          <ModalClose />
          <Typography
            level="h3"
            variant="plain"
            noWrap
          >
            Register Authentication Flows in an authenticator service
          </Typography>
          To save your authentication flows in an authenticator service you have to follow the following steps:<br /><br />
          1. Open ENS.
          <button onClick={openENS} style={{ width: "420px" }}>Open ENS</button>
          2. Search your name to edit a record in it.{name ? ` You used ${name}.` : ""}<br />
          3. Go to the Records option.<br />
          4. Add a Text record with the key "authenticator". Or edit it if it already exists.<br />
          5. Fill the value of the "authenticator" record with the URL of your authenticator flows.<br />
          <button onClick={copyAuthenticatorURL} style={{ width: "420px" }}>Copy authenticator URL to clipboard</button>
          6. Save confirming the transaction with your wallet.<br />
          7. Done! Your authenticator flows URL is now stored in ENS.<br /><br />

          We already saved your authentication flows in our authenticator server.<br />
          You can go back Home and log in to the dApp using your name.
        </ModalDialog>
      </Modal>
    </div>
  );
}
