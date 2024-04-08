import { ManifestBuilder, createC2pa, createTestSigner } from "c2pa-node";
import fs from "fs/promises";
import { resolve } from 'node:path';

const signer = await createTestSigner();
const sdk = createC2pa({ signer });
const uploadDir1 = "./uploaded_assets";

async function readJsonFile(filePath: string): Promise<any> {
  const fileContent = await fs.readFile(filePath, "utf-8");
  const jsonObj = JSON.parse(fileContent);
  return jsonObj;
} //readJsonFile

/* 
  Sign an asset buffer with a manifest.
   uploadedFile arg is the req.file object from Express.
   manifestFilePath is the path to the manifest file.
*/
export async function signAssetBuffer( uploadedFile: any, manifestFilePath: string) { 
  const imageBuffer = uploadedFile.buffer;
  const mimeType = uploadedFile.mimetype;

  try {
    const manifestObject = await readJsonFile( resolve(manifestFilePath) );
    manifestObject.title = uploadedFile.originalname;
    console.log(manifestObject);
    // Sign the asset with the manifest and return the signed asset
    const { signedAsset } = await sdk.sign({
      asset: { buffer: uploadedFile.buffer, mimeType },
      manifest: new ManifestBuilder( manifestObject ) 
    });
    return signedAsset;

  } catch (error) {
    console.error(`Error reading JSON file: ${error}`);
    return null;
  }
} // signAssetBuffer


/* 
  Sign a file with a manifest.
   asset is req.file from Multer
   manifestFilePath is the path to the manifest file.
*/
export async function signFile (asset: any, manifestFilePath: string) {
  try {
    if (asset) {
      const uploadDir = "./uploaded_assets";
      const outputPath = resolve(`${uploadDir}/signed_${asset.filename}`);

      const manifestObject = await readJsonFile( resolve(manifestFilePath) );
      manifestObject.title = "Node.js Example test file signing";
      console.log(manifestObject);
      const manifest = new ManifestBuilder( manifestObject );

      const { signedAsset, signedManifest } = await sdk.sign({
        manifest,
        asset,
        options: {
          outputPath,
        },
      });
    } //if

  } catch (error) {
    console.error(`ERROR: ${error}`);
    throw error;
  }
} // signFile
