const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GardenCore", function () {
  async function deploy() {
    const [owner, player] = await ethers.getSigners();

    const Items = await ethers.getContractFactory("Items1155");
    const items = await Items.deploy("");

    const Garden = await ethers.getContractFactory("GardenCore");
    const garden = await Garden.deploy(await items.getAddress(), 12);

    // grant roles to garden
    await items.setMinter(await garden.getAddress(), true);
    await items.setBurner(await garden.getAddress(), true);

    // define plot defs (0 and 1 free/available; 2 paid)
    await garden.setPlotDef(0, 0, 0, 1, 1, 0, true);
    await garden.setPlotDef(1, 1, 0, 1, 1, 0, true);
    await garden.setPlotDef(2, 2, 0, 1, 1, ethers.parseEther("0.01"), true);
    await garden.setPlotDef(3, 3, 0, 1, 1, ethers.parseEther("0.02"), true);

    // set seed config for type 1
    await garden.setSeedConfig(1, {
      growDuration: 2,
      seedTokenId: 1001,
      cropTokenId: 2001,
      buyPriceWei: ethers.parseEther("0.001"),
      sellPriceWei: ethers.parseEther("0.0005"),
      active: true,
    });

    return { owner, player, items, garden };
  }

  it("buys seeds with exact value and mints", async () => {
    const { garden, items } = await deploy();
    const [owner] = await ethers.getSigners();

    const qty = 3n;
    const price = ethers.parseEther("0.001");
    await expect(garden.buySeeds(1, qty, { value: price * qty }))
      .to.emit(garden, "SeedsPurchased");

    const bal = await items.balanceOf(owner.address, 1001);
    expect(bal).to.equal(qty);
  });

  it("reverts on wrong value", async () => {
    const { garden } = await deploy();
    await expect(garden.buySeeds(1, 1, { value: 0 })).to.be.reverted;
  });

  it("plants burns seed and sets plot", async () => {
    const { garden, items } = await deploy();
    const [owner] = await ethers.getSigners();
    await garden.buySeeds(1, 1, { value: ethers.parseEther("0.001") });

    await garden.plant(0, 1);
    expect(await items.balanceOf(owner.address, 1001)).to.equal(0);

    const packed = await garden.getPlot(owner.address, 0);
    expect(packed).to.not.equal(0);
  });

  it("harvests only after maturity and mints crop", async () => {
    const { garden, items } = await deploy();
    const [owner] = await ethers.getSigners();
    await garden.buySeeds(1, 1, { value: ethers.parseEther("0.001") });
    await garden.plant(0, 1);

    await expect(garden.harvest(0)).to.be.reverted; // not mature yet

    // increase time
    await ethers.provider.send("evm_increaseTime", [3]);
    await ethers.provider.send("evm_mine", []);

    await expect(garden.harvest(0)).to.emit(garden, "Harvested");
    expect(await items.balanceOf(owner.address, 2001)).to.equal(1);

    // harvested plot should be cleared
    const packedAfter = await garden.getPlot(owner.address, 0);
    expect(packedAfter).to.equal(0);
  });

  it("sells crops and gets paid", async () => {
    const { garden, items } = await deploy();
    const [owner] = await ethers.getSigners();
    await garden.buySeeds(1, 1, { value: ethers.parseEther("0.001") });
    await garden.plant(0, 1);
    await ethers.provider.send("evm_increaseTime", [3]);
    await ethers.provider.send("evm_mine", []);
    await garden.harvest(0);

    const balBefore = await ethers.provider.getBalance(owner.address);
    const tx = await garden.sellCrops(1, 1);
    const receipt = await tx.wait();
    const gas = receipt?.fee ?? 0n;
    const balAfter = await ethers.provider.getBalance(owner.address);
    const expected = balBefore - gas + ethers.parseEther("0.0005");
    expect(balAfter).to.equal(expected);

    expect(await items.balanceOf(owner.address, 2001)).to.equal(0);
  });

  it("enforces initial free plots and requires purchase to use higher plotIds", async () => {
    const { garden } = await deploy();
    const [owner] = await ethers.getSigners();

    // buy a seed and try to plant on plot 2 (should be locked initially)
    await garden.buySeeds(1, 1, { value: ethers.parseEther("0.001") });
    await expect(garden.plant(2, 1)).to.be.reverted; // PlotLocked

    // buy exactly one more plot (plotId 2) for 0.01 ETH
    await expect(garden.buyPlots(1, { value: ethers.parseEther("0.01") }))
      .to.emit(garden, "PlotsPurchased");

    // now planting on plot 2 should work
    await expect(garden.plant(2, 1)).to.emit(garden, "Planted");
  });

  it("reverts when buying plots with wrong value or exceeding max", async () => {
    const { garden } = await deploy();

    // wrong value for 1 plot (needs 0.01)
    await expect(garden.buyPlots(1, { value: ethers.parseEther("0.009") })).to.be.reverted;

    // buy plots up to limit then exceed
    await garden.buyPlots(1, { value: ethers.parseEther("0.01") }); // unlock plot 2
    // requesting an excessive amount beyond plotCount should revert
    await expect(garden.buyPlots(1000, { value: 0 })).to.be.reverted;
  });
});


