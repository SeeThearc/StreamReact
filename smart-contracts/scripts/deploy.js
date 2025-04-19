const hre = require("hardhat");

async function main() {
  console.log("Starting deployment process...");

  // Get the contract factory
  const SubscriptionPayment = await hre.ethers.getContractFactory(
    "SubscriptionPayment"
  );

  console.log("Deploying SubscriptionPayment contract...");

  // Use a properly formatted Ethereum address for your service wallet
  const serviceWalletAddress = "0xe8Db8B1E4D2c48d99cEF3421942A344DFaDad8ae"; // Replace with your actual address

  // Deploy the contract with constructor parameters
  const deployTx = await SubscriptionPayment.deploy(serviceWalletAddress);

  console.log("Waiting for deployment transaction to be mined...");

  // Wait for deployment and get contract instance
  const contractAddress = await deployTx.getAddress();

  console.log(`SubscriptionPayment deployed to: ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
