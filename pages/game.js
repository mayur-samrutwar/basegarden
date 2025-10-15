import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { useAccount } from "wagmi";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky, Grid } from "@react-three/drei";

function Character({ position, rotation, isWalking }) {
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

function CameraController({ characterPosition, characterRotation }) {
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

function GardenScene({ characterPosition, characterRotation, isWalking }) {
  return (
    <>
      {/* Simple Blue Sky */}
      <Sky
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0}
        azimuth={0.25}
      />
      
      {/* Clean Lego-style Floor */}
      <Grid
        renderOrder={-1}
        position={[0, -0.01, 0]}
        infiniteGrid
        cellSize={0.5}
        cellThickness={0.3}
        cellColor="#FFFFFF"
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor="#000000"
        fadeDistance={100}
        fadeStrength={0.3}
        followCamera={false}
        followCameraSpeed={0.01}
      />
      
      {/* Character */}
      <Character position={characterPosition} rotation={characterRotation} isWalking={isWalking} />
      
      {/* Camera Controller */}
      <CameraController 
        characterPosition={characterPosition} 
        characterRotation={characterRotation} 
      />
      
      {/* Simple Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
    </>
  );
}

export default function Game() {
  const router = useRouter();
  const { isConnected, isConnecting } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [characterPosition, setCharacterPosition] = useState([0, 0, 0]);
  const [characterRotation, setCharacterRotation] = useState(0);
  const [keys, setKeys] = useState({ w: false, s: false, a: false, d: false, q: false, e: false });
  const [isWalking, setIsWalking] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isConnected && !isConnecting) {
      router.replace("/");
    }
  }, [mounted, isConnected, isConnecting, router]);

  // Smooth movement with continuous key handling
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (['w', 's', 'a', 'd', 'q', 'e'].includes(key)) {
        setKeys(prev => ({ ...prev, [key]: true }));
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (['w', 's', 'a', 'd', 'q', 'e'].includes(key)) {
        setKeys(prev => ({ ...prev, [key]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Smooth movement loop
  useEffect(() => {
    const moveInterval = setInterval(() => {
      const speed = 0.1;
      const rotationSpeed = 0.05;
      
      // Check if character is moving
      const isMoving = keys.w || keys.s || keys.a || keys.d;
      setIsWalking(isMoving);
      
      setCharacterPosition(prev => {
        const [x, y, z] = prev;
        let newX = x;
        let newZ = z;
        
        if (keys.w) {
          newX += Math.sin(characterRotation) * speed;
          newZ += Math.cos(characterRotation) * speed;
        }
        if (keys.s) {
          newX -= Math.sin(characterRotation) * speed;
          newZ -= Math.cos(characterRotation) * speed;
        }
        if (keys.a) {
          newX += Math.cos(characterRotation) * speed;
          newZ -= Math.sin(characterRotation) * speed;
        }
        if (keys.d) {
          newX -= Math.cos(characterRotation) * speed;
          newZ += Math.sin(characterRotation) * speed;
        }
        
        return [newX, y, newZ];
      });
      
      setCharacterRotation(prev => {
        let newRotation = prev;
        if (keys.q) newRotation += rotationSpeed;
        if (keys.e) newRotation -= rotationSpeed;
        return newRotation;
      });
    }, 32); // ~30fps - slower updates

    return () => clearInterval(moveInterval);
  }, [keys, characterRotation]);

  // Show loading while checking connection
  if (!mounted || isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Checking wallet connection...</p>
        </div>
      </div>
    );
  }

  // If not connected, don't render anything (redirect will happen)
  if (!isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr]">
      <header className="flex justify-end p-4">
        <Wallet>
          <ConnectWallet />
          <WalletDropdown>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </header>
      <main className="relative">
        <Canvas
          camera={{ position: [0, 0, 0], fov: 60 }}
          style={{ width: "100%", height: "100vh" }}
        >
          <GardenScene 
            characterPosition={characterPosition} 
            characterRotation={characterRotation}
            isWalking={isWalking}
          />
        </Canvas>
        
        {/* Controls hint */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded">
          <p className="text-sm">WASD: Move | Q/E: Turn</p>
        </div>
      </main>
    </div>
  );
}