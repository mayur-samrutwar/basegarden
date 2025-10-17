// Diagnostic script: reads seed configs, ERC1155 balances, and plot cells for a given address
import 'dotenv/config';
// Usage: node scripts/diagnoseState.js --address 0xYourAddress [--plots 0,1]

import { createPublicClient, http, getAddress } from 'viem';
import { base, baseSepolia } from 'viem/chains';

// Minimal ABIs
const ERC1155_ABI = [
  { "type": "function", "name": "balanceOf", "stateMutability": "view", "inputs": [ {"name":"account","type":"address"}, {"name":"id","type":"uint256"} ], "outputs": [ {"type":"uint256"} ] }
];

const GARDEN_CORE_ABI = [
  { "type":"function", "name":"getSeedConfig", "stateMutability":"view", "inputs":[ {"name":"seedType","type":"uint16"} ], "outputs":[
      {"name":"seedTokenId","type":"uint256"},
      {"name":"cropTokenId","type":"uint256"},
      {"name":"buyPriceWei","type":"uint256"},
      {"name":"sellPriceWei","type":"uint256"},
      {"name":"growDuration","type":"uint64"},
      {"name":"active","type":"bool"}
  ]},
  { "type":"function", "name":"getPlotCells", "stateMutability":"view", "inputs":[ {"name":"player","type":"address"}, {"name":"plotId","type":"uint256"} ], "outputs":[ {"type":"uint256[12]"} ] },
];

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--address') out.address = args[++i];
    if (a === '--plots') out.plots = args[++i];
  }
  return out;
}

function toHex(value) {
  const v = BigInt(value);
  return '0x' + v.toString(16);
}

function decodeCell(packed) {
  const v = BigInt(packed);
  if (v === 0n) return null;
  const status = Number((v >> 0n) & 0x3n);
  const seedType = Number((v >> 2n) & 0x3FFFn);
  const plantedAt = Number((v >> 16n) & 0xFFFFFFFFFFFFFFFFn);
  const growDuration = Number((v >> 80n) & 0xFFFFFFFFn);
  const nowSec = Math.floor(Date.now()/1000);
  const ready = nowSec >= plantedAt + growDuration;
  return { status, seedType, plantedAt, growDuration, ready };
}

async function main() {
  const { address, plots } = parseArgs();
  if (!address) {
    console.error('Missing --address');
    process.exit(1);
  }
  const player = getAddress(address);

  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '84532', 10);
  const chain = chainId === 8453 ? base : baseSepolia;
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || process.env.BASE_RPC_URL || (chainId === 84532 ? 'https://sepolia.base.org' : 'https://mainnet.base.org');

  const gardenCoreAddress = process.env.NEXT_PUBLIC_GARDENCORE_ADDRESS;
  const items1155Address = process.env.NEXT_PUBLIC_ITEMS1155_ADDRESS;
  if (!gardenCoreAddress || !items1155Address) {
    console.error('Missing NEXT_PUBLIC_GARDENCORE_ADDRESS or NEXT_PUBLIC_ITEMS1155_ADDRESS');
    process.exit(1);
  }

  const client = createPublicClient({ chain, transport: http(rpcUrl) });

  console.log('Chain:', chainId, chain.name);
  console.log('GardenCore:', gardenCoreAddress);
  console.log('Items1155:', items1155Address);
  console.log('Player:', player);

  const seedTypes = [1,2,3];
  console.log('\nSeed Configs:');
  const seedConfigs = await Promise.all(seedTypes.map((t)=> client.readContract({
    address: gardenCoreAddress,
    abi: GARDEN_CORE_ABI,
    functionName: 'getSeedConfig',
    args: [t],
  })));
  seedConfigs.forEach((cfg, idx) => {
    const [seedTokenId, cropTokenId, buyPriceWei, sellPriceWei, growDuration, active] = cfg;
    console.log(` type=${seedTypes[idx]} seedTokenId=${seedTokenId} cropTokenId=${cropTokenId} buyPriceWei=${buyPriceWei} grow=${growDuration}s active=${active}`);
  });

  console.log('\nBalances:');
  for (let i = 0; i < seedTypes.length; i++) {
    const [seedTokenId, cropTokenId] = seedConfigs[i];
    const seedBal = await client.readContract({ address: items1155Address, abi: ERC1155_ABI, functionName: 'balanceOf', args: [player, seedTokenId] });
    const cropBal = await client.readContract({ address: items1155Address, abi: ERC1155_ABI, functionName: 'balanceOf', args: [player, cropTokenId] });
    console.log(` type=${seedTypes[i]} seed=${seedBal} crop=${cropBal}`);
  }

  const plotList = (plots ? plots.split(',').map((n)=> parseInt(n,10)) : [0,1]);
  console.log('\nPlots:');
  for (const pid of plotList) {
    const cells = await client.readContract({ address: gardenCoreAddress, abi: GARDEN_CORE_ABI, functionName: 'getPlotCells', args: [player, BigInt(pid)] });
    const decoded = cells.map((c)=> decodeCell(c));
    const summary = decoded.map((d,i)=> d ? `{i:${i},t:${d.seedType},ready:${d.ready}}` : '.').join(' ');
    console.log(` plot ${pid}:`, summary);
  }
}

main().catch((e)=> { console.error(e); process.exit(1); });


