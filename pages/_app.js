import "@/styles/globals.css";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { WagmiProvider, createConfig, http } from "wagmi";
import { coinbaseWallet, metaMask, walletConnect } from "@wagmi/connectors";
import { base, baseSepolia } from "wagmi/chains";
import { NotificationProvider } from "@/components/NotificationSystem";

export default function App({ Component, pageProps }) {
  const apiKey =
    process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || "your_api_key_here";
  const envChainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "84532", 10);
  const targetChain = envChainId === 84532 ? baseSepolia : base;
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";

  const config = createConfig({
    chains: [baseSepolia],
    connectors: [
      coinbaseWallet({ appName: 'BaseGarden' }),
      metaMask(),
      walletConnect({ projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo' }),
    ],
    transports: {
      [baseSepolia.id]: http(rpcUrl),
    },
    autoConnect: true,
    ssr: true,
  });

  return (
    <WagmiProvider config={config}>
      <OnchainKitProvider
        apiKey={apiKey}
        chain={targetChain}
        config={{
          appearance: { mode: "auto" },
          wallet: { display: "modal", preference: "all" },
        }}
      >
        <NotificationProvider>
          <div className="min-h-screen">
            {/* Fixed transparent overlay region for any global UI */}
            <div className="fixed inset-x-0 top-0 z-50 pointer-events-none" />
            <Component {...pageProps} />
          </div>
        </NotificationProvider>
      </OnchainKitProvider>
    </WagmiProvider>
  );
}
