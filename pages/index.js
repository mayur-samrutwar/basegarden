import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";

export default function Home() {
  const router = useRouter();
  const { isConnected, isConnecting } = useAccount();

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
        {isConnecting && <div className="ml-4 text-xs text-gray-500">Connecting wallet…</div>}
        {!isConnecting && isConnected && <div className="ml-4 text-xs text-green-600">Wallet connected</div>}
      </main>
    </div>
  );
}
