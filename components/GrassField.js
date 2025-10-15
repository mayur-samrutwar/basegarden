import { useMemo } from "react";

export default function GrassField() {
  // Generate grass data once and memoize it
  const grassBlades = useMemo(() => {
    return Array.from({ length: 200 }, (_, i) => {
      const x = (Math.random() - 0.5) * 48;
      const z = (Math.random() - 0.5) * 48;
      const height = 0.1 + Math.random() * 0.15;
      const rotation = Math.random() * Math.PI * 2;
      
      return {
        id: i,
        x,
        z,
        height,
        rotation
      };
    });
  }, []);

  const grassPatches = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const x = (Math.random() - 0.5) * 48;
      const z = (Math.random() - 0.5) * 48;
      const size = 0.3 + Math.random() * 0.4;
      
      return {
        id: i,
        x,
        z,
        size
      };
    });
  }, []);

  return (
    <>
      {/* Fresh Grass Garden Floor */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshLambertMaterial color="#6bb86b" />
      </mesh>
      
      {/* Fresh Grass Blades */}
      {grassBlades.map((grass) => (
        <mesh 
          key={`grass-${grass.id}`} 
          position={[grass.x, grass.height/2, grass.z]} 
          rotation={[0, grass.rotation, 0]}
        >
          <boxGeometry args={[0.02, grass.height, 0.02]} />
          <meshLambertMaterial color="#7cc87c" />
        </mesh>
      ))}
      
      {/* Bright Grass Patches */}
      {grassPatches.map((patch) => (
        <mesh 
          key={`patch-${patch.id}`} 
          position={[patch.x, 0.05, patch.z]} 
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[patch.size, patch.size]} />
          <meshLambertMaterial color="#8dd88d" transparent opacity={0.7} />
        </mesh>
      ))}
    </>
  );
}
