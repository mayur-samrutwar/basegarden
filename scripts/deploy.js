const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Deploy Items1155
  const Items = await ethers.getContractFactory("Items1155");
  const items = await Items.deploy("");
  await items.waitForDeployment();
  const itemsAddress = await items.getAddress();
  console.log("Items1155:", itemsAddress);

  // Deploy GardenToken (ERC20 $GARDEN)
  const Token = await ethers.getContractFactory("GardenToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("GardenToken:", tokenAddress);

  // Deploy GardenCore with plotCount=12
  const Garden = await ethers.getContractFactory("GardenCore");
  const garden = await Garden.deploy(itemsAddress, 12);
  await garden.waitForDeployment();
  const gardenAddress = await garden.getAddress();
  console.log("GardenCore:", gardenAddress);

  // Grant roles
  await (await items.setMinter(gardenAddress, true)).wait();
  await (await items.setBurner(gardenAddress, true)).wait();

  // Wire GardenToken and fund rewards
  await (await garden.setGardenToken(tokenAddress)).wait();
  await (await token.setMinter(deployer.address, true)).wait();
  await (await token.mint(gardenAddress, ethers.parseEther("1000000"))).wait();

  // Configure example plots (0,1 free; 2 priced)
  await (await garden.setPlotDef(0, 0, 0, 1, 1, 0, true)).wait();
  await (await garden.setPlotDef(1, 1, 0, 1, 1, 0, true)).wait();
  await (await garden.setPlotDef(2, 2, 0, 1, 1, ethers.parseEther("0.01"), true)).wait();

  // Configure one seed type
  await (
    await garden.setSeedConfig(1, {
      growDuration: 60, // 1 minute
      seedTokenId: 1001,
      cropTokenId: 2001,
      buyPriceWei: ethers.parseEther("0.001"),
      sellPriceWei: ethers.parseEther("0.0005"),
      active: true,
    })
  ).wait();

  // Write .env entries
  const envPath = path.join(process.cwd(), ".env");
  const chainId = (await ethers.provider.getNetwork()).chainId.toString();
  const updates = {
    NEXT_PUBLIC_CHAIN_ID: chainId,
    NEXT_PUBLIC_ITEMS1155_ADDRESS: itemsAddress,
    NEXT_PUBLIC_GARDENCORE_ADDRESS: gardenAddress,
    NEXT_PUBLIC_GARDEN_TOKEN_ADDRESS: tokenAddress,
  };
  writeEnv(envPath, updates);
  console.log(".env updated at", envPath);
}

function writeEnv(envPath, updates) {
  let lines = [];
  if (fs.existsSync(envPath)) {
    lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  }
  const map = new Map();
  for (const line of lines) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) continue;
    const idx = line.indexOf("=");
    const key = line.slice(0, idx);
    const val = line.slice(idx + 1);
    map.set(key, val);
  }
  for (const [k, v] of Object.entries(updates)) {
    map.set(k, v);
  }
  const output = Array.from(map.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("\n") + "\n";
  fs.writeFileSync(envPath, output);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});


