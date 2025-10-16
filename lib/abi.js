export const gardenCoreAbi = [
  { "inputs": [{"internalType":"uint16","name":"seedType","type":"uint16"}], "name":"getSeedConfig", "outputs":[{"components":[{"internalType":"uint32","name":"growDuration","type":"uint32"},{"internalType":"uint16","name":"seedTokenId","type":"uint16"},{"internalType":"uint16","name":"cropTokenId","type":"uint16"},{"internalType":"uint96","name":"buyPriceWei","type":"uint96"},{"internalType":"uint96","name":"sellPriceWei","type":"uint96"},{"internalType":"bool","name":"active","type":"bool"}], "internalType":"struct GardenCore.SeedConfig", "name":"", "type":"tuple"}], "stateMutability":"view", "type":"function"},
  { "inputs": [{"internalType":"uint16","name":"seedType","type":"uint16"},{"internalType":"uint256","name":"qty","type":"uint256"}], "name":"buySeeds", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [{"internalType":"uint16","name":"plotId","type":"uint16"},{"internalType":"uint16","name":"seedType","type":"uint16"}], "name":"plant", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"internalType":"uint16","name":"plotId","type":"uint16"}], "name":"harvest", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"internalType":"address","name":"player","type":"address"}], "name":"plotsLimitOf", "outputs": [{"internalType":"uint16","name":"","type":"uint16"}], "stateMutability":"view", "type":"function" }
];

export const items1155Abi = [
  { "inputs": [{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"id","type":"uint256"}], "name":"balanceOf", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability":"view", "type":"function"}
];

export const erc20Abi = [
  { "inputs": [{"internalType":"address","name":"account","type":"address"}], "name":"balanceOf", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability":"view", "type":"function" },
  { "inputs": [], "name": "decimals", "outputs": [{"internalType":"uint8","name":"","type":"uint8"}], "stateMutability":"view", "type":"function" }
];


