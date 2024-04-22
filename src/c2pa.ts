import { FileAsset, ManifestBuilder, createC2pa, createTestSigner } from "c2pa-node";
import fs from "fs/promises";
import { resolve } from 'node:path';

const signer = await createTestSigner();
const sdk = createC2pa({ signer });
const uploadDir1 = "./uploaded_assets";

/* 
  Reads a JSON file and returns an object.  Used to read the manifest file.
*/
async function readJsonFile(filePath: string): Promise<any> {
  const fileContent = await fs.readFile(filePath, "utf-8");
  const jsonObj = JSON.parse(fileContent);
  return jsonObj;
} //readJsonFile

/* 
  Sign an asset buffer with a manifest. Arguments:
  - uploadedFile: The req.file object from Express.
  - manifestFilePath: The path to the manifest file.
*/
export async function signAssetBuffer(uploadedFile: any, manifestFilePath: string) {
  const imageBuffer = uploadedFile.buffer;
  const mimeType = uploadedFile.mimetype;

  try {
    const manifestObject = await readJsonFile(resolve(manifestFilePath));
    manifestObject.title = uploadedFile.originalname;
    // Sign the asset with the manifest and return the signed asset
    const { signedAsset } = await sdk.sign({
      asset: { buffer: uploadedFile.buffer, mimeType },
      manifest: new ManifestBuilder(manifestObject)
    });
    return signedAsset;

  } catch (error) {
    console.error(`Error reading JSON file: ${error}`);
    return null;
  }
} // signAssetBuffer


/* 
  Sign a file with a manifest. Arguments:
  - file: The req.file from Multer
  - manifestFilePath: The path to the manifest file.
*/
export async function signFile(file: Express.Multer.File, manifestFilePath: string) {
  try {

    const uploadDir = "./uploaded_assets";
    const outputPath = resolve(`${uploadDir}/signed_${file.filename}`);

    const manifestObject = await readJsonFile(resolve(manifestFilePath));
    manifestObject.title = "Node.js Example test file signing";
    const manifest = new ManifestBuilder(manifestObject);

    const { signedAsset } = await sdk.sign({
      manifest,
      asset: {
        path: file.path,
        mimeType: file.mimetype
      },
      options: {
        outputPath,
      },
    });

    signedAsset.path = outputPath;
    return signedAsset;

  } catch (error) {
    console.error(`ERROR: ${error}`);
    throw error;
  }
} // signFile
