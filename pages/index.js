import { useRouter } from "next/router";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr]">
      <header className="flex justify-end p-4">
        <Wallet>
          <ConnectWallet />
          <WalletDropdown>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </header>
      <main className="flex items-center justify-center">
        <button
          onClick={() => router.push("/game")}
          className="px-8 py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black shadow-sm hover:opacity-90 transition"
        >
          Play
        </button>
      </main>
    </div>
  );
}
