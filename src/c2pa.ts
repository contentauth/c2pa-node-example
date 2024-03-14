import { ManifestBuilder, createC2pa, createTestSigner } from "c2pa-node";
import fs from "fs/promises";

const signer = await createTestSigner();
const sdk = createC2pa({ signer });

export async function signAssetBuffer(imageBuffer: Buffer, mimeType: string) {
  const { signedAsset } = await sdk.sign({
    asset: { buffer: imageBuffer, mimeType},
    manifest: getManifest(),
  });

  return signedAsset;
}

function getManifest() {
  const manifest = new ManifestBuilder({
    claim_generator: "c2pa-node-example",
    title: "JWST.png",
    format: "image/png",
    assertions: [],
  });

  return manifest;
}
