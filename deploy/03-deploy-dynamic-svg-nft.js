const { network, ethers } = require("hardhat")
const {developmentChains, networkConfig} = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async function({getNamedAccounts, deployments}){
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress

    if(developmentChains.includes(network.name)){
        const EthUsdAggregator = await ethers.getContract("MockV3Aggregator")
        ethUsdPriceFeedAddress = EthUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    log("----Deploying Dynamic SVG NFT--------------")
    const lowSVG = await fs.readFileSync("./images/dynamicNft/frown.svg", {encoding: "utf-8"})
    const highSVG = await fs.readFileSync("./images/dynamicNft/happy.svg", {encoding: "utf-8"})

    args = [ethUsdPriceFeedAddress, lowSVG, highSVG]
    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfigrmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying....")
        await verify(dynamicSvgNft.address, args)
    }


}

module.exports.tags = ["all", "dynamicsvg", "main"]