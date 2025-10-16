const { Wallet } = require("ethers");
const fs = require("fs");
const path = require("path");

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

async function main() {
  const wallet = Wallet.createRandom();
  const address = wallet.address;
  const pk = wallet.privateKey;

  const envPath = path.join(process.cwd(), ".env");
  writeEnv(envPath, { DEPLOYER_PRIVATE_KEY: pk });

  console.log("Generated deployer address:", address);
  console.log("Private key written to .env as DEPLOYER_PRIVATE_KEY (keep it secret)");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});


