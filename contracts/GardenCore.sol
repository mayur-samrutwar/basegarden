// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {PlotCodec} from "./PlotCodec.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IItems1155 is IERC1155 {
    function mint(address to, uint256 id, uint256 amount, bytes memory data) external;
    function burn(address from, uint256 id, uint256 amount) external;
}

contract GardenCore is Ownable, ReentrancyGuard {
    using PlotCodec for uint256;

    struct SeedConfig {
        uint32 growDuration; // seconds
        uint16 seedTokenId;
        uint16 cropTokenId;
        uint96 buyPriceWei;  // price per seed in wei
        uint96 sellPriceWei; // price per crop in wei
        bool active;
    }

    // errors
    error InvalidSeedType();
    error InactiveSeed();
    error WrongMsgValue();
    error PlotNotEmpty();
    error PlotNotMature();
    error AlreadyHarvested();
    error InvalidQuantity();
    error TransferFailed();
    error OutOfBoundsPlot();
    error PlotLocked();
    error ExceedsMaxPlots();

    event SeedsPurchased(address indexed player, uint16 indexed seedType, uint256 qty, uint256 value);
    event Planted(address indexed player, uint16 indexed plotId, uint16 seedType, uint64 plantedAt);
    event Harvested(address indexed player, uint16 indexed plotId, uint16 seedType, uint64 harvestedAt);
    event CropsSold(address indexed player, uint16 indexed seedType, uint256 qty, uint256 rewardGarden);
    event SeedConfigUpdated(uint16 indexed seedType, SeedConfig cfg);
    event PlotsPerPlayerUpdated(uint16 plots);
    event Items1155Updated(address items1155);
    event PlotDefUpdated(uint16 indexed plotId, int32 x, int32 y, uint16 width, uint16 height, uint96 priceWei, bool available);
    event PlotsPurchased(address indexed player, uint16 fromPlotId, uint16 qty, uint256 value);

    // storage
    IItems1155 public items1155;
    IERC20 public gardenToken;
    // Total number of plot definitions available in the fixed play area (global bound)
    uint16 public plotCount;
    mapping(uint16 => SeedConfig) public seedConfigs;
    mapping(address => mapping(uint16 => uint256)) public plots; // packed

    // Plot definitions configured by admin
    struct PlotDef { int32 x; int32 y; uint16 width; uint16 height; uint96 priceWei; bool available; }
    mapping(uint16 => PlotDef) public plotDefs;
    // Player-specific unlocked plot limit (number of plots from 0..limit-1 accessible). 0 => defaultInitialFreePlots
    mapping(address => uint16) public playerPlotLimit;
    uint16 public initialFreePlots = 2; // each player gets 2 plots initially

    constructor(address _items1155, uint16 _plotCount) Ownable(msg.sender) {
        items1155 = IItems1155(_items1155);
        plotCount = _plotCount;
    }

    // views
    function getSeedConfig(uint16 seedType) external view returns (SeedConfig memory) {
        return seedConfigs[seedType];
    }

    function getPlot(address player, uint16 plotId) external view returns (uint256) {
        if (plotId >= plotCount) revert OutOfBoundsPlot();
        return plots[player][plotId];
    }

    function getPlayerPlots(address player) external view returns (uint256[] memory out) {
        out = new uint256[](plotCount);
        for (uint16 i = 0; i < plotCount; i++) {
            out[i] = plots[player][i];
        }
    }

    function plotsLimitOf(address player) public view returns (uint16) {
        uint16 lim = playerPlotLimit[player];
        if (lim == 0) return initialFreePlots;
        return lim;
    }

    function decodePlot(uint256 packedPlot) external pure returns (uint8 status, uint16 seedType, uint64 plantedAt, uint32 growDuration) {
        status = PlotCodec.statusOf(packedPlot);
        seedType = PlotCodec.seedTypeOf(packedPlot);
        plantedAt = PlotCodec.plantedAtOf(packedPlot);
        growDuration = PlotCodec.growDurationOf(packedPlot);
    }

    // actions
    function buySeeds(uint16 seedType, uint256 qty) external payable {
        SeedConfig memory cfg = seedConfigs[seedType];
        if (!cfg.active) revert InactiveSeed();
        if (qty == 0) revert InvalidQuantity();
        uint256 cost = uint256(cfg.buyPriceWei) * qty;
        if (msg.value != cost) revert WrongMsgValue();
        items1155.mint(msg.sender, uint256(cfg.seedTokenId), qty, "");
        emit SeedsPurchased(msg.sender, seedType, qty, cost);
    }

    function plant(uint16 plotId, uint16 seedType) external {
        if (plotId >= plotCount) revert OutOfBoundsPlot();
        if (plotId >= plotsLimitOf(msg.sender)) revert PlotLocked();
        SeedConfig memory cfg = seedConfigs[seedType];
        if (!cfg.active) revert InactiveSeed();

        uint256 current = plots[msg.sender][plotId];
        if (PlotCodec.statusOf(current) != 0) revert PlotNotEmpty();

        // burn one seed
        items1155.burn(msg.sender, uint256(cfg.seedTokenId), 1);

        uint256 packed = PlotCodec.encode(1, seedType, uint64(block.timestamp), cfg.growDuration);
        plots[msg.sender][plotId] = packed;
        emit Planted(msg.sender, plotId, seedType, uint64(block.timestamp));
    }

    function harvest(uint16 plotId) external {
        if (plotId >= plotCount) revert OutOfBoundsPlot();
        uint256 current = plots[msg.sender][plotId];
        uint8 status = PlotCodec.statusOf(current);
        if (status == 0) revert PlotNotMature();
        if (status == 2) revert AlreadyHarvested();

        uint64 plantedAt = PlotCodec.plantedAtOf(current);
        uint32 growDuration = PlotCodec.growDurationOf(current);
        if (block.timestamp < plantedAt + growDuration) revert PlotNotMature();

        uint16 seedType = PlotCodec.seedTypeOf(current);
        SeedConfig memory cfg = seedConfigs[seedType];

        // clear to empty to allow immediate replanting
        plots[msg.sender][plotId] = 0;

        // mint crop
        items1155.mint(msg.sender, uint256(cfg.cropTokenId), 1, "");
        emit Harvested(msg.sender, plotId, seedType, uint64(block.timestamp));
    }

    function sellCrops(uint16 seedType, uint256 qty) external nonReentrant {
        if (qty == 0) revert InvalidQuantity();
        SeedConfig memory cfg = seedConfigs[seedType];
        if (!cfg.active) revert InactiveSeed();
        // burn crops
        items1155.burn(msg.sender, uint256(cfg.cropTokenId), qty);
        // reward in GARDEN at 1e18 units per wei of sellPriceWei by default
        uint256 reward = uint256(cfg.sellPriceWei) * qty; // treat sellPriceWei as reward baseline
        require(address(gardenToken) != address(0), "garden token not set");
        bool ok = gardenToken.transfer(msg.sender, reward);
        require(ok, "garden transfer failed");
        emit CropsSold(msg.sender, seedType, qty, reward);
    }

    // purchasing plots (per-player unlock)
    function buyPlots(uint16 qty) external payable {
        if (qty == 0) revert InvalidQuantity();
        uint16 start = plotsLimitOf(msg.sender);
        uint16 end = start + qty;
        if (end > plotCount) revert ExceedsMaxPlots();

        uint256 total;
        // Sum prices for the next plots [start, end)
        for (uint16 i = start; i < end; i++) {
            PlotDef memory defn = plotDefs[i];
            // If not explicitly available, treat as free (0 price) but still allow unlock
            if (!defn.available) revert PlotLocked();
            total += uint256(defn.priceWei);
        }
        if (msg.value != total) revert WrongMsgValue();

        playerPlotLimit[msg.sender] = end;
        emit PlotsPurchased(msg.sender, start, qty, total);
    }

    // admin
    function setSeedConfig(uint16 seedType, SeedConfig calldata cfg) external onlyOwner {
        if (cfg.growDuration == 0) revert InvalidQuantity();
        seedConfigs[seedType] = cfg;
        emit SeedConfigUpdated(seedType, cfg);
    }

    function setPlotCount(uint16 plotCount_) external onlyOwner {
        require(plotCount_ > 0 && plotCount_ <= 1024, "bounds");
        plotCount = plotCount_;
        emit PlotsPerPlayerUpdated(plotCount_);
    }

    function setItems1155(address newAddr) external onlyOwner {
        items1155 = IItems1155(newAddr);
        emit Items1155Updated(newAddr);
    }

    function setGardenToken(address newAddr) external onlyOwner {
        gardenToken = IERC20(newAddr);
    }

    function withdraw(address payable to, uint256 amount) external onlyOwner {
        (bool ok, ) = to.call{value: amount}("");
        if (!ok) revert TransferFailed();
    }

    function setInitialFreePlots(uint16 count) external onlyOwner {
        require(count > 0 && count <= 32, "bounds");
        initialFreePlots = count;
    }

    function setPlotDef(uint16 plotId, int32 x, int32 y, uint16 width, uint16 height, uint96 priceWei, bool available) external onlyOwner {
        require(plotId < 1024, "id");
        plotDefs[plotId] = PlotDef(x, y, width, height, priceWei, available);
        emit PlotDefUpdated(plotId, x, y, width, height, priceWei, available);
    }
}


