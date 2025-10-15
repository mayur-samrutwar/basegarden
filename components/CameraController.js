import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

export default function CameraController({ characterPosition, characterRotation }) {
  const { camera } = useThree();
  const cameraRef = useRef({ 
    targetPosition: [0, 0, 0], 
    currentPosition: [0, 0, 0],
    lastUpdate: 0
  });
  
  useFrame((state, delta) => {
    const [charX, charY, charZ] = characterPosition;
    
    // Calculate desired camera position based on character's facing direction
    const distance = 4;
    const height = 3;
    
    // Camera follows character's facing direction
    const targetX = charX - Math.sin(characterRotation) * distance;
    const targetZ = charZ - Math.cos(characterRotation) * distance;
    const targetY = charY + height;
    
    // Smooth camera movement with delta time
    const current = cameraRef.current;
    const lerpFactor = Math.min(delta * 2, 0.1); // Much smoother interpolation
    
    current.currentPosition[0] += (targetX - current.currentPosition[0]) * lerpFactor;
    current.currentPosition[1] += (targetY - current.currentPosition[1]) * lerpFactor;
    current.currentPosition[2] += (targetZ - current.currentPosition[2]) * lerpFactor;
    
    camera.position.set(
      current.currentPosition[0],
      current.currentPosition[1],
      current.currentPosition[2]
    );
    
    // Camera looks at character
    camera.lookAt(charX, charY + 1, charZ);
  });

  return null;
}
