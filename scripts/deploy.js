const hre = require("hardhat");

async function main() {
  console.log("Deploying EscroGame contract...");

  const EscroGame = await hre.ethers.getContractFactory("EscroGame");
  const escroGame = await EscroGame.deploy();

  await escroGame.deployed();

  console.log("✅ EscroGame deployed to:", escroGame.address);
  console.log("\n📝 Update CONTRACT_ADDRESS in:");
  console.log("   - script.js");
  console.log("   - server.js");
  console.log("   - .env file (if using)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

