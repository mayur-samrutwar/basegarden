import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { items1155Abi } from "../lib/abi";

export default function InventorySidebar({ items1155Address, seeds }) {
  const { address } = useAccount();
  const [open, setOpen] = useState(false);
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '84532', 10);

  const balances = seeds.map(({ seedTokenId, cropTokenId }) => ({
    seed: useReadContract({
      address: items1155Address,
      abi: items1155Abi,
      functionName: "balanceOf",
      args: address ? [address, BigInt(seedTokenId)] : undefined,
      chainId,
      query: { enabled: !!address && !!items1155Address, refetchInterval: 3000 },
    }).data || 0n,
    crop: useReadContract({
      address: items1155Address,
      abi: items1155Abi,
      functionName: "balanceOf",
      args: address ? [address, BigInt(cropTokenId)] : undefined,
      chainId,
      query: { enabled: !!address && !!items1155Address, refetchInterval: 3000 },
    }).data || 0n,
  }));

  if (typeof window !== 'undefined') {
    console.debug('[Inventory] chainId', chainId, 'player', address, 'items1155', items1155Address);
    console.debug('[Inventory] seeds', seeds);
    console.debug('[Inventory] raw balances', balances);
  }

  return (
    <>
      <button
        onClick={()=>setOpen(v=>!v)}
        className="absolute top-4 right-4 z-50 bg-black/70 text-white rounded-full px-4 py-2 shadow hover:bg-black/80"
      >
        {open ? 'Close Inventory' : 'Open Inventory'}
      </button>
      <div className={`fixed top-0 right-0 h-full w-80 z-40 transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full bg-black/70 backdrop-blur text-white p-4">
          <h3 className="text-lg font-semibold mb-3">Inventory</h3>
          <div className="space-y-4">
            {seeds.map((s, i) => (
              <div key={s.type} className="border border-white/10 rounded-lg p-3">
                <div className="font-medium">{s.name}</div>
                <div className="text-sm opacity-80">Grows in {s.growDuration}s</div>
                <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="opacity-80">Seeds</div>
                    <div className="font-semibold">{String(balances[i].seed)}</div>
                  </div>
                  <div>
                    <div className="opacity-80">Crops</div>
                    <div className="font-semibold">{String(balances[i].crop)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}


