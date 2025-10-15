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
      <Component {...pageProps} />
    </OnchainKitProvider>
  );
}
