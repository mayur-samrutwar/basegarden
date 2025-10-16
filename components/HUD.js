import { useAccount, useBalance, useReadContract } from "wagmi";
import { erc20Abi } from "../lib/abi";

export default function HUD({ gardenTokenAddress }) {
  const { address } = useAccount();
  const { data: ethBal } = useBalance({ address });

  const { data: gardenBal } = useReadContract({
    address: gardenTokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!gardenTokenAddress },
  });

  return (
    <div className="absolute top-4 left-4 z-50">
      <div className="bg-black/60 backdrop-blur text-white rounded-full px-5 py-2 shadow flex items-center gap-4">
        <div className="text-xs uppercase tracking-wide opacity-80">Balances</div>
        <div className="h-4 w-px bg-white/30" />
        <div className="text-sm font-medium">ETH {ethBal ? Number(ethBal.formatted).toFixed(4) : "-"}</div>
        <div className="text-sm font-medium">$GARDEN {gardenBal ? (Number(gardenBal) / 1e18).toFixed(2) : "0.00"}</div>
      </div>
    </div>
  );
}


