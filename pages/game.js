import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useBalance, useReadContract, useReadContracts, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { gardenCoreAbi, items1155Abi } from "../lib/abi";
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
import CropShop from "../components/CropShop";
import HUD from "../components/HUD";
import InventorySidebar from "../components/InventorySidebar";

function GardenScene({ characterPosition, characterRotation, isWalking, onCellClick, hovered, setHovered, plantingCell, plotCells, cellInfo }) {
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
      <Plots onCellClick={onCellClick} hovered={hovered} setHovered={setHovered} plantingCell={plantingCell} plotCells={plotCells} cellInfo={cellInfo} plots={[
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
  const { isConnected, isConnecting, address } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [characterPosition, setCharacterPosition] = useState([0, 0, 0]);
  const [characterRotation, setCharacterRotation] = useState(0);
  const [keys, setKeys] = useState({ w: false, s: false, a: false, d: false, q: false, e: false });
  const [isWalking, setIsWalking] = useState(false);
  const [nearSeedShop, setNearSeedShop] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [nearCropShop, setNearCropShop] = useState(false);
  const [cropShopOpen, setCropShopOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [plantingCell, setPlantingCell] = useState(null);
  const [harvestingCell, setHarvestingCell] = useState(null);
  const [selectedSeedType, setSelectedSeedType] = useState(null);

  const seedShop = useMemo(() => ({ x: 8, z: 15, width: 3.4, depth: 6.4 }), []);
  // Addresses and chain must be declared before any reads below
  const gardenCoreAddress = process.env.NEXT_PUBLIC_GARDENCORE_ADDRESS;
  const items1155Address = process.env.NEXT_PUBLIC_ITEMS1155_ADDRESS;
  const gardenTokenAddress = process.env.NEXT_PUBLIC_GARDEN_TOKEN_ADDRESS;
  const { writeContractAsync } = useWriteContract();
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '84532', 10);
  // Read on-chain seed configs to avoid price/active mismatches
  const seedTypes = [1,2,3];
  const seedCfgContracts = useMemo(() => (
    gardenCoreAddress ? seedTypes.map((t)=> ({ address: gardenCoreAddress, abi: gardenCoreAbi, functionName: 'getSeedConfig', args: [t], chainId })) : []
  ), [gardenCoreAddress, chainId]);
  const { data: seedCfgData } = useReadContracts({ contracts: seedCfgContracts, query: { enabled: !!gardenCoreAddress } });
  const seedList = useMemo(() => {
    return seedTypes.map((t, idx) => {
      const d = seedCfgData && seedCfgData[idx] ? seedCfgData[idx].result : undefined;
      const growDuration = d ? Number(d.growDuration) : 0;
      const buyPriceWei = d ? BigInt(d.buyPriceWei) : 0n;
      const active = d ? Boolean(d.active) : false;
      return { type: t, name: t===1? 'Carrot' : t===2? 'Mint' : 'Sage', growDuration, buyPriceWei, active };
    });
  }, [seedCfgData]);
  const seedTokenIds = (seedCfgData || []).map((d)=> Number(d?.result?.seedTokenId || 0));
  const seedBalContracts = useMemo(() => (
    address && items1155Address ? seedTokenIds.filter(id=>id>0).map((id)=> ({ address: items1155Address, abi: items1155Abi, functionName: 'balanceOf', args: [address, BigInt(id)], chainId })) : []
  ), [address, items1155Address, seedTokenIds.join('|'), chainId]);
  const { data: seedBalData } = useReadContracts({ contracts: seedBalContracts, query: { enabled: !!address && !!items1155Address && seedBalContracts.length>0, refetchInterval: 4000 } });
  const seedBalances = seedTypes.map((_, idx) => {
    const id = seedTokenIds[idx] || 0;
    if (!id) return 0n;
    const pos = seedTokenIds.filter(n=>n>0).indexOf(id);
    const entry = seedBalData && seedBalData[pos] ? seedBalData[pos].result : 0n;
    return typeof entry === 'bigint' ? entry : 0n;
  });

  if (typeof window !== 'undefined') {
    console.debug('[Game] env chainId', chainId);
    console.debug('[Game] addresses', { gardenCoreAddress, items1155Address, gardenTokenAddress });
  }

  // Read plot cell states for two visible plots (0 and 1)
  const plotIds = [0, 1];
  const plotContracts = useMemo(() => (
    address && gardenCoreAddress ? plotIds.map((pid)=> ({ address: gardenCoreAddress, abi: gardenCoreAbi, functionName: 'getPlotCells', args: [address, pid], chainId })) : []
  ), [address, gardenCoreAddress, chainId]);
  const { data: plotData, refetch: refetchPlots } = useReadContracts({ contracts: plotContracts, query: { enabled: !!address && !!gardenCoreAddress, refetchInterval: 4000 } });
  const plotCells = (plotData || []).map((entry) => {
    const arr = entry?.result || [];
    return Array.from({ length: 12 }, (_, i) => (typeof arr[i] !== 'undefined' ? arr[i] : 0n));
  });
  if (typeof window !== 'undefined') {
    console.debug('[Game] plotCells', plotCells);
  }
  // derive cell info for readiness without extra RPC: decode plantedAt & growDuration from packed value
  const nowSec = Math.floor(Date.now() / 1000);
  const cellInfo = plotCells.map((cells) => cells.map((packed) => {
    const v = typeof packed === 'bigint' ? packed : 0n;
    if (v === 0n) return null;
    // packed layout from PlotCodec: bits [0..1]=status, [2..15]=seedType, [16..79]=plantedAt, [80..111]=growDuration
    const status = Number((v >> 0n) & 0x3n);
    const seedType = Number((v >> 2n) & 0x3FFFn);
    const plantedAt = Number((v >> 16n) & 0xFFFFFFFFFFFFFFFFn);
    const growDuration = Number((v >> 80n) & 0xFFFFFFFFn);
    const ready = nowSec >= plantedAt + growDuration;
    return { status, seedType, plantedAt, growDuration, ready };
  }));
  const handleCellClick = (plotIdx, cellId) => {
    if (!gardenCoreAddress) return;
    const packed = plotCells[plotIdx] ? plotCells[plotIdx][cellId] : 0n;
    const isOccupied = typeof packed === 'bigint' ? packed !== 0n : false;
    const info = cellInfo && cellInfo[plotIdx] ? cellInfo[plotIdx][cellId] : null;

    // If occupied and ready -> harvest
    if (isOccupied && info && info.ready) {
      setHarvestingCell({ plotIdx, cellId });
      writeContractAsync({
        address: gardenCoreAddress,
        abi: gardenCoreAbi,
        functionName: 'harvest',
        args: [plotIdx, cellId],
      }).then(()=>{
        refetchPlots?.();
        setTimeout(()=> setHarvestingCell(null), 800);
      }).catch(()=>{
        setHarvestingCell(null);
      });
      return;
    }

    // If occupied but not ready -> do nothing
    if (isOccupied) return;

    // Planting flow (empty cell): must have seed selected and balance > 0
    if (!selectedSeedType) {
      window.alert('Select a seed in the inventory first');
      return;
    }
    const selIdx = seedTypes.indexOf(selectedSeedType);
    const balData = selIdx >= 0 ? seedBalances[selIdx]?.data : undefined;
    const seedQty = typeof balData === 'bigint' ? balData : 0n;
    if (seedQty === 0n) return;

    setPlantingCell({ plotIdx, cellId });
    writeContractAsync({
      address: gardenCoreAddress,
      abi: gardenCoreAbi,
      functionName: 'plant',
      args: [plotIdx, cellId, selectedSeedType],
    }).then(()=>{
      refetchPlots?.();
      setTimeout(()=> setPlantingCell(null), 1200);
    }).catch(()=>{
      setPlantingCell(null);
    });
  };

  useEffect(() => {
    const handler = (e) => {
      const { seedType, qty } = e.detail || {};
      if (!seedType || !qty) return;
      if (!gardenCoreAddress) return;
      const seed = seedList.find(s => s.type === seedType);
      if (!seed) return;
      if (!seed.active) {
        window.alert('This seed is not available');
        return;
      }
      // call buySeeds with exact msg.value from on-chain price
      const value = (seed.buyPriceWei || 0n) * BigInt(qty);
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
    // ensure we only consider client-side after mount to avoid SSR mismatch
    setMounted(true);
  }, []);

  // Remove redirect logic - let the connect gate handle it

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
      if (key === 'o' && nearCropShop) {
        setCropShopOpen(true);
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
  }, [nearSeedShop, nearCropShop]);

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
          { x: 8, z: 15, width: 6.4, depth: 3.4, type: 'seed' },
          { x: -8, z: 15, width: 6.4, depth: 3.4, type: 'crop' }
        ];
        
        // Check collision with each shop
        let nearSeed = false;
        let nearCrop = false;
        for (const shop of shops) {
          const insideShopX = newX >= shop.x - shop.width/2 && newX <= shop.x + shop.width/2;
          const insideShopZ = newZ >= shop.z - shop.depth/2 && newZ <= shop.z + shop.depth/2;
          
          if (insideShopX && insideShopZ) {
            // Character is inside shop, revert to previous position
            newX = x;
            newZ = z;
            break;
          }
          // proximity check (within 2 units)
          const dx = newX - shop.x;
          const dz = newZ - shop.z;
          const dist = Math.sqrt(dx*dx + dz*dz);
          if (shop.type === 'seed' && dist < 2.2) nearSeed = true;
          if (shop.type === 'crop' && dist < 2.2) nearCrop = true;
        }
        setNearSeedShop(nearSeed);
        setNearCropShop(nearCrop);
        
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

  // Connect gate - aligned layout with left-aligned text inside a centered container
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-xl px-6">
          <h1 className="text-3xl font-bold mb-3">Connect Wallet to Play</h1>
          <p className="text-gray-600 mb-6">You need to connect your wallet to access the garden</p>
          <div>
            <Wallet>
              <ConnectWallet />
              <WalletDropdown>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          </div>
        </div>
      </div>
    );
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
      <main className="relative min-h-screen">
        <div className="absolute inset-0">
          <Canvas
            camera={{ position: [0, 0, 0], fov: 60 }}
            style={{ width: "100%", height: "100%" }}
          >
          <GardenScene 
            characterPosition={characterPosition} 
            characterRotation={characterRotation}
            isWalking={isWalking}
            onCellClick={handleCellClick}
            hovered={hovered}
            setHovered={setHovered}
            plantingCell={plantingCell}
            plotCells={plotCells}
            cellInfo={cellInfo}
          />
          </Canvas>
        </div>
        
        {/* Controls hint */}
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded">
          <p className="text-sm">WASD: Move | Q/E: Turn</p>
        </div>

        {/* Seed shop proximity hint */}
        <ProximityHint visible={nearSeedShop && !marketOpen} text="Press P to open Seed Shop" />
        <ProximityHint visible={nearCropShop && !cropShopOpen} text="Press O to open Crop Shop" />

        {/* Seed marketplace modal */}
        <SeedMarketplace open={marketOpen} onClose={()=>setMarketOpen(false)} seeds={seedList} />
        {/* Crop shop modal */}
        <CropShop open={cropShopOpen} onClose={()=>setCropShopOpen(false)} gardenCoreAddress={gardenCoreAddress} items1155Address={items1155Address} />

        {/* HUD */}
        <HUD gardenTokenAddress={gardenTokenAddress} />

        {/* Inventory Sidebar */}
        <InventorySidebar items1155Address={items1155Address} selectedSeedType={selectedSeedType} onSelectSeed={setSelectedSeedType} seeds={[
          { type:1, name:'Carrot', growDuration:60, seedTokenId:1001, cropTokenId:2001 },
          { type:2, name:'Mint', growDuration:10, seedTokenId:1002, cropTokenId:2002 },
          { type:3, name:'Sage', growDuration:20, seedTokenId:1003, cropTokenId:2003 },
        ]} />
      </main>
    </div>
  );
}