import { useEffect, useState } from "react";

export default function SeedMarketplace({ open, onClose, seeds = [] }) {
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!open) {
      setSelected(null);
      setQty(1);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Seed Marketplace</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {seeds.map((s) => (
            <button
              key={s.type}
              onClick={() => setSelected(s)}
              className={`border rounded-xl p-4 text-left hover:shadow-md transition ${selected?.type===s.type? 'border-black' : 'border-gray-200'}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-gray-500">Grows in {s.growDuration}s</div>
                </div>
                <div className="text-sm font-semibold">{s.priceEth} ETH</div>
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
            disabled={!selected}
            className="px-4 py-2 rounded-lg bg-black text-white disabled:bg-gray-300"
            onClick={()=>{
              // Placeholder: emit event to purchase in parent
              const detail = { seedType: selected?.type, qty };
              window.dispatchEvent(new CustomEvent('seed:buy', { detail }));
              onClose();
            }}
          >
            {selected ? `Buy ${qty}` : 'Select a seed'}
          </button>
        </div>
      </div>
    </div>
  );
}


