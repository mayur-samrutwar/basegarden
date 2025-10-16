import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

export default function Plots({ plots = [], onCellClick, hovered, setHovered, plantingCell, plotCells }) {
  const groupRefs = useRef([]);
  const [t, setT] = useState(0);

  useFrame((_, delta) => {
    setT((v) => (v + delta));
  });
  return (
    <>
      {plots.map((p, idx) => (
        <group key={`plot-${idx}`} position={[p.x, 0.02, p.z]} ref={(el)=>groupRefs.current[idx]=el}>
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
            const isHovered = hovered && hovered.plotIdx === idx && hovered.cellId === i;
            const isPlanting = plantingCell && plantingCell.plotIdx === idx && plantingCell.cellId === i;
            const occupied = !!(plotCells && plotCells[idx] && (plotCells[idx][i] ?? 0n) !== 0n);
            return (
              <mesh
                key={`cell-${i}`}
                position={[cx, 0.03, cz]}
                onPointerOver={(e)=>{ e.stopPropagation(); setHovered?.({ plotIdx: idx, cellId: i }); }}
                onPointerOut={(e)=>{ e.stopPropagation(); setHovered?.(null); }}
                onClick={() => onCellClick?.(idx, i)}
              >
                <boxGeometry args={[cellW * 0.95, 0.01, cellD * 0.95]} />
                <meshStandardMaterial color={occupied ? "#5f4a35" : (isHovered ? "#a06a4b" : "#8a5a3b")} emissive={isHovered ? "#ffd9a6" : "#000000"} emissiveIntensity={isHovered ? 0.3 : 0} />
                {isPlanting && (
                  <mesh position={[0, 0.05 + Math.sin(t * 8) * 0.01, 0]}>
                    <boxGeometry args={[cellW * 0.5, 0.02, cellD * 0.5]} />
                    <meshStandardMaterial color="#6bbf59" />
                  </mesh>
                )}
                {occupied && !isPlanting && (
                  <mesh position={[0, 0.05, 0]}>
                    <boxGeometry args={[cellW * 0.4, 0.02, cellD * 0.4]} />
                    <meshStandardMaterial color="#3f8f3a" />
                  </mesh>
                )}
              </mesh>
            );
          })}
        </group>
      ))}
    </>
  );
}


