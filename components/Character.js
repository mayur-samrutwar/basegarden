import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

export default function Character({ position, rotation, isWalking }) {
  const groupRef = useRef();
  const [walkCycle, setWalkCycle] = useState(0);
  
  useFrame(() => {
    if (isWalking) {
      setWalkCycle(prev => prev + 0.1);
    }
  });

  // Calculate walking animation values
  const legSwing = Math.sin(walkCycle) * 0.15;
  const armSwing = Math.sin(walkCycle + Math.PI) * 0.15; // Opposite phase to legs
  const bodyBob = Math.abs(Math.sin(walkCycle)) * 0.03;

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      {/* Body */}
      <mesh position={[0, 0.5 + bodyBob, 0]}>
        <boxGeometry args={[0.6, 1, 0.3]} />
        <meshLambertMaterial color="#4ECDC4" />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.2 + bodyBob, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshLambertMaterial color="#FFEAA7" />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.1, 1.3 + bodyBob, 0.2]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      <mesh position={[0.1, 1.3 + bodyBob, 0.2]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      
      {/* Left Arm */}
      <mesh 
        position={[-0.4, 0.8 + bodyBob, 0]} 
        rotation={[armSwing, 0, 0]}
      >
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshLambertMaterial color="#FFEAA7" />
      </mesh>
      
      {/* Right Arm */}
      <mesh 
        position={[0.4, 0.8 + bodyBob, 0]} 
        rotation={[-armSwing, 0, 0]}
      >
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshLambertMaterial color="#FFEAA7" />
      </mesh>
      
      {/* Left Leg */}
      <mesh 
        position={[-0.15, -0.2 + bodyBob, 0]} 
        rotation={[legSwing, 0, 0]}
      >
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshLambertMaterial color="#4ECDC4" />
      </mesh>
      
      {/* Right Leg */}
      <mesh 
        position={[0.15, -0.2 + bodyBob, 0]} 
        rotation={[-legSwing, 0, 0]}
      >
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshLambertMaterial color="#4ECDC4" />
      </mesh>
    </group>
  );
}
