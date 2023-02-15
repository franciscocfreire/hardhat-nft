const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const pinataApiKey = process.env.PINATA_API_KEY
const pinataSecretApiKey = process.env.PINATA_API_SECRET
const pinataJwt = process.env.PINATA_JWT
// Use the api keys by specifying your api key and api secret

const pinata = new pinataSDK({ pinataApiKey: pinataApiKey, pinataSecretApiKey: pinataSecretApiKey });
//const pinata = new pinataSDK({ pinataJWTKey: pinataJwt});

// ./images/randomNft
async function storeImages(imagesFilePath){

    await pinata.testAuthentication().then((result) => {
        //handle successful authentication here
        console.log(`Pinata successful login: ${result}`);
    }).catch((err) => {
        //handle error here
        console.log(err);
    });

    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    let responses = []
    console.log("Uploading to IPFS")
    for(fileIndex in files){
        const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`)
        const options = {
            pinataMetadata: {
                name: files[fileIndex],
            },
        }
        try{
            console.log(`Uploading this file ${files[fileIndex]}`)
            await pinata.pinFileToIPFS(readableStreamForFile, options)
            .then((result) => {
                responses.push(result)
            })
            .catch((err) => {
                console.log(err)
            })

        }catch (error){
            console.log(error)
        }

    }

    return {responses, files}
}

async function storeTokenUriMetadata(metadata){
    try{
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    }catch(error){
        console.log(error)
    }

    return null
}

module.exports = {storeImages, storeTokenUriMetadata}