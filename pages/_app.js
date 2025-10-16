import "@/styles/globals.css";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { base } from "wagmi/chains";

export default function App({ Component, pageProps }) {
  const apiKey =
    process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY || "your_api_key_here";

  return (
    <OnchainKitProvider
      apiKey={apiKey}
      chain={base}
      config={{
        appearance: { mode: "auto" },
        wallet: { display: "modal", preference: "all" },
      }}
    >
      <div className="min-h-screen">
        {/* Fixed transparent overlay region for any global UI */}
        <div className="fixed inset-x-0 top-0 z-50 pointer-events-none" />
        <Component {...pageProps} />
      </div>
    </OnchainKitProvider>
  );
}
