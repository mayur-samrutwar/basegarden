import { useMemo, useState } from "react";
import { useReadContracts } from "wagmi";
import { gardenCoreAbi, items1155Abi } from "../lib/abi";
import { useNotificationActions } from "./NotificationSystem";
import { encodeFunctionData } from "viem";

export default function CropShop({ open, onClose, gardenCoreAddress, items1155Address, seedTypes = [1,2,3], accountAddress, provider, subAccountAddress, chainHex }) {
  const { showLoading, showSuccess, showError } = useNotificationActions();
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '84532', 10);
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // read on-chain configs for names and prices
  const cfgContracts = (gardenCoreAddress ? seedTypes.map((t)=> ({ address: gardenCoreAddress, abi: gardenCoreAbi, functionName: 'getSeedConfig', args: [t], chainId })) : []);
  const { data: cfgData } = useReadContracts({ contracts: cfgContracts, query: { enabled: !!gardenCoreAddress } });
  const cropTokenIds = (cfgData || []).map((d)=> Number(d?.result?.cropTokenId || 0));
  const balContracts = (accountAddress && items1155Address ? cropTokenIds.filter(id=>id>0).map((id)=> ({ address: items1155Address, abi: items1155Abi, functionName: 'balanceOf', args: [accountAddress, BigInt(id)], chainId })) : []);
  const { data: balData } = useReadContracts({ contracts: balContracts, query: { enabled: !!accountAddress && !!items1155Address && balContracts.length>0, refetchInterval: 4000 } });

  const items = seedTypes.map((t, i) => {
    const d = cfgData && cfgData[i] ? cfgData[i].result : undefined;
    const id = cropTokenIds[i] || 0;
    const pos = cropTokenIds.filter(n=>n>0).indexOf(id);
    const bal = pos>=0 && balData && balData[pos] ? (balData[pos].result || 0n) : 0n;
    return {
      type: t,
      name: t===1?'Carrot': t===2?'Mint':'Sage',
      sellPriceWei: d ? BigInt(d.sellPriceWei) : 0n,
      qty: bal,
      active: d ? Boolean(d.active) : false,
    };
  });

  if (!open) return null;

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Crop Shop</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {items.map((it)=> (
            <button key={it.type} onClick={()=>setSelected(it)} className={`border rounded-xl p-4 text-left hover:shadow-md transition ${selected?.type===it.type? 'border-black' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-gray-500">You have {String(it.qty)} crops</div>
                </div>
                <div className="text-xs text-gray-600">Sell @ {(Number(it.sellPriceWei)/1e18).toFixed(6)} GARDEN</div>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Quantity</span>
            <input type="number" min={1} value={qty} onChange={(e)=>setQty(parseInt(e.target.value||'1'))} className="w-20 border rounded-lg px-2 py-1" />
          </div>
          <button
            disabled={!selected || qty<=0 || (selected && selected.qty < BigInt(qty)) || submitting || !selected?.active}
            className="px-4 py-2 rounded-lg bg-black text-white disabled:bg-gray-300"
            onClick={async()=>{
              if (!selected) return;
              try {
                setSubmitting(true);
                showLoading(`Selling ${qty} ${selected.name} crops...`);
                console.debug('[CropShop] sell click', { seedType: selected.type, qty });
                if (!provider || !subAccountAddress) throw new Error('Sub Account not ready');
                const data = encodeFunctionData({ abi: gardenCoreAbi, functionName: 'sellCrops', args: [selected.type, BigInt(qty)] });
                await provider.request({
                  method: 'wallet_sendCalls',
                  params: [{
                    version: '2.0',
                    atomicRequired: true,
                    chainId: chainHex,
                    from: subAccountAddress,
                    calls: [{ to: gardenCoreAddress, data, value: '0x0' }],
                  }],
                });
                showSuccess(`${qty} ${selected.name} crops sold successfully!`);
                onClose?.();
              } catch (e) {
                console.error('[CropShop] sell failed', e);
                showError('Failed to sell crops. Please try again.');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitting ? 'Selling…' : (selected ? `Sell ${qty}` : 'Select crop')}
          </button>
        </div>
      </div>
    </div>
  );
}


