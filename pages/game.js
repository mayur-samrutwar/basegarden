import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useBalance, useReadContract, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { gardenCoreAbi } from "../lib/abi";
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
import Shop2 from "../components/Shop2";
import Plots from "../components/Plots";
import ProximityHint from "../components/ProximityHint";
import SeedMarketplace from "../components/SeedMarketplace";
import HUD from "../components/HUD";
import InventorySidebar from "../components/InventorySidebar";

function GardenScene({ characterPosition, characterRotation, isWalking, onCellClick }) {
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

      {/* Initial free plots (2) rendered as soil */}
      <Plots onCellClick={onCellClick} plots={[
        { x: -5, z: 0, width: 4, depth: 4 },
        { x: -0.5, z: 0, width: 4, depth: 4 },
      ]} />

      {/* Shops */}
      <Shop position={[8, 0, 15]} rotation={[0, Math.PI/2, 0]} />
      <Shop2 position={[-8, 0, 15]} rotation={[0, Math.PI/2, 0]} />
      
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
  const [nearSeedShop, setNearSeedShop] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);

  const seedShop = useMemo(() => ({ x: 8, z: 15, width: 3.4, depth: 6.4 }), []);
  const seedList = useMemo(() => ([
    { type: 1, name: 'Carrot', growDuration: 60, priceEth: '0.001' },
    { type: 2, name: 'Mint', growDuration: 10, priceEth: '0.001' },
    { type: 3, name: 'Sage', growDuration: 20, priceEth: '0.0015' },
  ]), []);

  const gardenCoreAddress = process.env.NEXT_PUBLIC_GARDENCORE_ADDRESS;
  const items1155Address = process.env.NEXT_PUBLIC_ITEMS1155_ADDRESS;
  const gardenTokenAddress = process.env.NEXT_PUBLIC_GARDEN_TOKEN_ADDRESS;
  const { writeContractAsync } = useWriteContract();
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '84532', 10);

  if (typeof window !== 'undefined') {
    console.debug('[Game] env chainId', chainId);
    console.debug('[Game] addresses', { gardenCoreAddress, items1155Address, gardenTokenAddress });
  }
  const handleCellClick = (plotIdx, cellId) => {
    // Example: attempt to plant Carrot (1) when clicking a cell
    if (!gardenCoreAddress) return;
    writeContractAsync({
      address: gardenCoreAddress,
      abi: gardenCoreAbi,
      functionName: 'plant',
      args: [plotIdx, cellId, 1],
    }).catch(()=>{});
  };

  useEffect(() => {
    const handler = (e) => {
      const { seedType, qty } = e.detail || {};
      if (!seedType || !qty) return;
      if (!gardenCoreAddress) return;
      const seed = seedList.find(s => s.type === seedType);
      if (!seed) return;
      // call buySeeds with msg.value
      const value = parseEther(seed.priceEth) * BigInt(qty);
      writeContractAsync({
        address: gardenCoreAddress,
        abi: gardenCoreAbi,
        functionName: 'buySeeds',
        args: [seedType, BigInt(qty)],
        value,
        chainId,
      }).then(()=>{
        setMarketOpen(false);
        // naive feedback
        window.alert('Purchase sent. Check wallet and inventory.');
      }).catch(()=>{});
    };
    window.addEventListener('seed:buy', handler);
    return () => window.removeEventListener('seed:buy', handler);
  }, [gardenCoreAddress, seedList, writeContractAsync]);

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
      if (key === 'p' && nearSeedShop) {
        setMarketOpen(true);
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
  }, [nearSeedShop]);

  // Smoother movement loop with reduced frequency
  useEffect(() => {
    const moveInterval = setInterval(() => {
      const speed = 0.08; // Reduced speed for smoother movement
      const rotationSpeed = 0.05;
      const gardenSize = 24; // Garden boundary (25 - 1 for safety)
      
      // Check if character is moving
      const isMoving = keys.w || keys.s || keys.a || keys.d;
      setIsWalking(isMoving);
      
      setCharacterPosition(prev => {
        const [x, y, z] = prev;
        let newX = x;
        let newZ = z;
        
        // Normalize diagonal movement to prevent double speed
        const moveX = (keys.d ? -1 : 0) + (keys.a ? 1 : 0);
        const moveZ = (keys.w ? 1 : 0) + (keys.s ? -1 : 0);
        
        // Apply movement with normalization for diagonal
        const moveLength = Math.sqrt(moveX * moveX + moveZ * moveZ);
        const normalizedX = moveLength > 0 ? moveX / moveLength : 0;
        const normalizedZ = moveLength > 0 ? moveZ / moveLength : 0;
        
        newX += (normalizedX * Math.cos(characterRotation) + normalizedZ * Math.sin(characterRotation)) * speed;
        newZ += (normalizedZ * Math.cos(characterRotation) - normalizedX * Math.sin(characterRotation)) * speed;
        
        // Shop collision detection for both shops (rotated 90 degrees)
        const shops = [
          // Both shop meshes are rotated 90deg, so use a wider horizontal AABB
          { x: 8, z: 15, width: 6.4, depth: 3.4 }, // seed shop
          { x: -8, z: 15, width: 6.4, depth: 3.4 } // other shop
        ];
        
        // Check collision with each shop
        let nearSeed = false;
        for (const shop of shops) {
          const insideShopX = newX >= shop.x - shop.width/2 && newX <= shop.x + shop.width/2;
          const insideShopZ = newZ >= shop.z - shop.depth/2 && newZ <= shop.z + shop.depth/2;
          
          if (insideShopX && insideShopZ) {
            // Character is inside shop, revert to previous position
            newX = x;
            newZ = z;
            break;
          }
          // proximity check (within 2 units) to seed shop only
          const dx = newX - seedShop.x;
          const dz = newZ - seedShop.z;
          const dist = Math.sqrt(dx*dx + dz*dz);
          if (dist < 2.2) nearSeed = true;
        }
        setNearSeedShop(nearSeed);
        
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
        }, 16); // ~60fps - back to smooth updates

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
            onCellClick={handleCellClick}
          />
        </Canvas>
        
        {/* Controls hint */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded">
          <p className="text-sm">WASD: Move | Q/E: Turn</p>
        </div>

        {/* Seed shop proximity hint */}
        <ProximityHint visible={nearSeedShop && !marketOpen} text="Press P to open Seed Shop" />

        {/* Seed marketplace modal */}
        <SeedMarketplace open={marketOpen} onClose={()=>setMarketOpen(false)} seeds={seedList} />

        {/* HUD */}
        <HUD gardenTokenAddress={gardenTokenAddress} />

        {/* Inventory Sidebar */}
        <InventorySidebar items1155Address={items1155Address} seeds={[
          { type:1, name:'Carrot', growDuration:60, seedTokenId:1001, cropTokenId:2001 },
          { type:2, name:'Mint', growDuration:10, seedTokenId:1002, cropTokenId:2002 },
          { type:3, name:'Sage', growDuration:20, seedTokenId:1003, cropTokenId:2003 },
        ]} />
      </main>
    </div>
  );
}