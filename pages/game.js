import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";

export default function Game() {
  const router = useRouter();
  const { isConnected, isConnecting } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isConnected && !isConnecting) {
      router.replace("/");
    }
  }, [mounted, isConnected, isConnecting, router]);

  // Show loading while checking connection
  if (!mounted || isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Checking wallet connection...</p>
        </div>
      </div>
    );
  }

  // If not connected, don't render anything (redirect will happen)
  if (!isConnected) {
    return null;
  }

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
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Game</h1>
          <p className="text-sm text-neutral-500">Your game content goes here.</p>
        </div>
      </main>
    </div>
  );
}


