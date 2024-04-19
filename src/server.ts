import express from "express";
import path from "path";
import serveIndex from 'serve-index';
import multer from 'multer';
import cors from "cors";
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { signAssetBuffer, signFile } from "./c2pa.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const manifestFile = "./manifests/manifest1.json";
const uploadDir = "./uploaded_assets";

const PORT = 3000;
const app = express();

app.use(cors());

// Serve the index.html file
app.get("/", async (req, res) => {
  res.sendFile(path.resolve(fileURLToPath(import.meta.url), "../index.html"));
});

/* 
  Uploads the file into a buffer using Multer Express middleware, signs the buffer, and then saves the file on the server. 
*/
const storage = multer.memoryStorage()
var upload = multer({ storage: storage })

app.post('/upload',
  upload.single('file'),
  async (req, res, next) => {

    console.log("Calling /upload route")
    if (req.file) {
      const signedAsset = await signAssetBuffer(req.file, manifestFile);

      if (signedAsset) {
        const fileName = `${Date.now()}_${req.file.originalname}`;
        await fs.writeFile(`${uploadDir}/${fileName}`, signedAsset.buffer);
        res.set("Content-Type", signedAsset.mimeType);
        res.send(signedAsset.buffer);

        console.log(`Inspect signed asset at: https://contentcredentials.org/verify?source=http://localhost:${PORT}/assets/${fileName}`);

      } else {
        res.send("Error signing asset buffer");
        console.log("signedAsset is null");
      }
    }
  })

/* 
  Uploads the file using Multer Express middleware, then signs and saves a copy of the file.  NOTE: This results in two copies of the file on the server, one signed and one unsigned.
*/
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}_${file.originalname}`;
    cb(null, `${fileName}`);
    console.log(`Inspect UNSIGNED asset at: https://contentcredentials.org/verify?source=http://localhost:${PORT}/assets/${fileName}`);
  },
});
const fileUpload = multer({ storage: fileStorage });

app.post('/upload_file_sign',
  fileUpload.single('file'),
  async (req, res) => {

    if (req.file) {
      const signedAsset = await signFile(req.file, manifestFile);
      console.log("Calling /upload_file_sign route")

      const fileName = path.basename(signedAsset.path);
      console.log(`Inspect signed asset at: https://contentcredentials.org/verify?source=http://localhost:${PORT}/assets/${fileName}`);

      if (signedAsset) {
        const buffer = await fs.readFile(signedAsset.path);
        res.set("Content-Type", signedAsset.mimeType);
        res.send(buffer);

      } else {
        res.send("Error signing asset buffer");
        console.log("signedAsset is null");
      }
    }
  });

// Serve the listing of uploaded assets
app.use('/assets',
  express.static(uploadDir),
  serveIndex(uploadDir, { 'icons': true })
)

// Serve the app and listen on specified port
app.listen(PORT, () => {
  console.log(`Load in your browser: http://localhost:${PORT}`);
});
