const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const gardenAddr = process.env.NEXT_PUBLIC_GARDENCORE_ADDRESS;
  if (!gardenAddr) throw new Error("NEXT_PUBLIC_GARDENCORE_ADDRESS not set in .env");

  const garden = await ethers.getContractAt("GardenCore", gardenAddr);

  // Seed type 2: 10 seconds
  await (
    await garden.setSeedConfig(2, {
      growDuration: 10,
      seedTokenId: 1002,
      cropTokenId: 2002,
      buyPriceWei: ethers.parseEther("0.001"),
      sellPriceWei: ethers.parseEther("0.0006"),
      active: true,
    })
  ).wait();

  // Seed type 3: 20 seconds
  await (
    await garden.setSeedConfig(3, {
      growDuration: 20,
      seedTokenId: 1003,
      cropTokenId: 2003,
      buyPriceWei: ethers.parseEther("0.0015"),
      sellPriceWei: ethers.parseEther("0.0009"),
      active: true,
    })
  ).wait();

  console.log("Configured seeds 2 (10s) and 3 (20s)");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});


