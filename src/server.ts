import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { signAssetBuffer } from "./c2pa.js";
import cors from "cors";

const PORT = 3000;

const app = express();

app.use(cors());

app.get("/", async (req, res) => {
  res.sendFile(path.resolve(fileURLToPath(import.meta.url), "../index.html"));
});

app.get("/sign", async (req, res) => {
  const signedAsset = await signAssetBuffer();
  res.set("Content-Type", signedAsset.mimeType);
  res.send(signedAsset.buffer);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
