import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { Canvas } from "@react-three/fiber";
import { Sky, Grid } from "@react-three/drei";
import Character from "../components/Character";
import CameraController from "../components/CameraController";
import GrassField from "../components/GrassField";
import Shop from "../components/Shop";

function GardenScene({ characterPosition, characterRotation, isWalking }) {
  return (
    <>
      {/* More Blue Sky */}
      <Sky
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0}
        azimuth={0.25}
        turbidity={2}
        rayleigh={0.5}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      
      {/* Grass Field */}
      <GrassField />
      
      {/* Garden Fences */}
      {/* North Fence - Connected Poles and Planks */}
      {Array.from({ length: 25 }, (_, i) => (
        <mesh key={`north-pole-${i}`} position={[-24 + i * 2, 0.5, 25]}>
          <boxGeometry args={[0.2, 1, 0.2]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
      ))}
      {Array.from({ length: 24 }, (_, i) => (
        <mesh key={`north-plank-${i}`} position={[-24 + i * 2 + 1, 0.7, 25]}>
          <boxGeometry args={[2, 0.2, 0.1]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
      ))}
      
      {/* South Fence */}
      {Array.from({ length: 25 }, (_, i) => (
        <mesh key={`south-pole-${i}`} position={[-24 + i * 2, 0.5, -25]}>
          <boxGeometry args={[0.2, 1, 0.2]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
      ))}
      {Array.from({ length: 24 }, (_, i) => (
        <mesh key={`south-plank-${i}`} position={[-24 + i * 2 + 1, 0.7, -25]}>
          <boxGeometry args={[2, 0.2, 0.1]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
      ))}
      
      {/* East Fence */}
      {Array.from({ length: 25 }, (_, i) => (
        <mesh key={`east-pole-${i}`} position={[25, 0.5, -24 + i * 2]}>
          <boxGeometry args={[0.2, 1, 0.2]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
      ))}
      {Array.from({ length: 24 }, (_, i) => (
        <mesh key={`east-plank-${i}`} position={[25, 0.7, -24 + i * 2 + 1]}>
          <boxGeometry args={[0.1, 0.2, 2]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
      ))}
      
      {/* West Fence */}
      {Array.from({ length: 25 }, (_, i) => (
        <mesh key={`west-pole-${i}`} position={[-25, 0.5, -24 + i * 2]}>
          <boxGeometry args={[0.2, 1, 0.2]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
      ))}
      {Array.from({ length: 24 }, (_, i) => (
        <mesh key={`west-plank-${i}`} position={[-25, 0.7, -24 + i * 2 + 1]}>
          <boxGeometry args={[0.1, 0.2, 2]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
      ))}
      
      {/* Grid Overlay */}
      <Grid
        renderOrder={-1}
        position={[0, -0.005, 0]}
        infiniteGrid={false}
        cellSize={0.5}
        cellThickness={0.2}
        cellColor="#e0e0e0"
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor="#333333"
        fadeDistance={25}
        fadeStrength={0.3}
        followCamera={false}
        followCameraSpeed={0.01}
      />

      {/* Shops */}
      <Shop position={[20, 0, 0]} />
      <Shop position={[-20, 0, 0]} />
      
      {/* Character */}
      <Character position={characterPosition} rotation={characterRotation} isWalking={isWalking} />
      
      {/* Camera Controller */}
      <CameraController 
        characterPosition={characterPosition} 
        characterRotation={characterRotation} 
      />
      
      {/* Stable Lighting */}
      <ambientLight intensity={0.8} color="#ffffff" />
      <directionalLight position={[10, 10, 5]} intensity={1.0} color="#ffffff" />
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

  // Smooth movement loop with boundary collision
  useEffect(() => {
    const moveInterval = setInterval(() => {
      const speed = 0.1;
      const rotationSpeed = 0.05;
      const gardenSize = 24; // Garden boundary (25 - 1 for safety)
      
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
        
        // Shop collision detection for both shops
        const shops = [
          { x: 20, z: 0, width: 6.4, depth: 3.4 },
          { x: -20, z: 0, width: 6.4, depth: 3.4 }
        ];
        
        // Check collision with each shop
        for (const shop of shops) {
          const insideShopX = newX >= shop.x - shop.width/2 && newX <= shop.x + shop.width/2;
          const insideShopZ = newZ >= shop.z - shop.depth/2 && newZ <= shop.z + shop.depth/2;
          
          if (insideShopX && insideShopZ) {
            // Character is inside shop, revert to previous position
            newX = x;
            newZ = z;
            break;
          }
        }
        
        // Boundary collision - keep character inside garden
        newX = Math.max(-gardenSize, Math.min(gardenSize, newX));
        newZ = Math.max(-gardenSize, Math.min(gardenSize, newZ));
        
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