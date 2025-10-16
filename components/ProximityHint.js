export default function ProximityHint({ visible, text }) {
  if (!visible) return null;
  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
      <div className="animate-bounce bg-black/70 text-white px-4 py-2 rounded-full shadow-lg">
        <span className="text-sm font-medium">{text}</span>
      </div>
    </div>
  );
}


