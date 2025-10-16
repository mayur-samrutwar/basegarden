export default function Plots({ plots = [], onCellClick }) {
  return (
    <>
      {plots.map((p, idx) => (
        <group key={`plot-${idx}`} position={[p.x, 0.02, p.z]}>
          <mesh>
            <boxGeometry args={[p.width, 0.04, p.depth]} />
            <meshStandardMaterial color="#7B4B2A" />
          </mesh>
          {/* grid 4x3 (width segments 4, depth segments 3) */}
          {Array.from({ length: 12 }, (_, i) => {
            const col = i % 4; // 0..3
            const row = Math.floor(i / 4); // 0..2
            const cellW = p.width / 4;
            const cellD = p.depth / 3;
            const cx = -p.width / 2 + cellW / 2 + col * cellW;
            const cz = -p.depth / 2 + cellD / 2 + row * cellD;
            return (
              <mesh key={`cell-${i}`} position={[cx, 0.03, cz]} onClick={() => onCellClick?.(idx, i)}>
                <boxGeometry args={[cellW * 0.95, 0.01, cellD * 0.95]} />
                <meshStandardMaterial color="#8a5a3b" />
              </mesh>
            );
          })}
        </group>
      ))}
    </>
  );
}


