require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
//   const accounts = await hre.ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
  //     {
  //       version: "0.5.0",
  //     },
      {
        version: "0.8.0",
      },
  //     {
  //       version: "0.8.1",
  //     },
    ],
  },
  // defaultNetwork: "pol",
  // networks: {
  //   hardhat: {
  //     url: "https://polygon-mainnet.g.alchemy.com/v2/Ua070gQRlYSeNTOIO1MUS5T2JPqprTRA",
  //     // accounts: ["1d00618d085638a0a78bbf2736ab6f84b4039b6edb2814e36bc014a975e092a2"],
  //     chainId: 137
  //     // forking: {
  //     //   url: "https://polygon-mainnet.g.alchemy.com/v2/Ua070gQRlYSeNTOIO1MUS5T2JPqprTRA",
  //     //   chainId: 137,
  //     //   blockNumber: 27573547,
  //     // }
  //   }
  // }
};
