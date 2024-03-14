import express from "express";
import path from "path";
import serveIndex from 'serve-index';
import multer from 'multer';
import cors from "cors";

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { signAssetBuffer } from "./c2pa.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3000;
const app = express();

app.use(cors());

// Serve the index.html file
app.get("/", async (req, res) => {
  res.sendFile(path.resolve(fileURLToPath(import.meta.url), "../index.html"));
});

// Sign and serve the asset
app.get("/sign", async (req, res) => {
  const signedAsset = await signAssetBuffer("JWST.png");
  res.set("Content-Type", signedAsset.mimeType);
  res.send(signedAsset.buffer);
});

// Serve the listing of uploaded assets
app.use('/assets', 
  express.static('uploaded_assets'), 
  serveIndex('uploaded_assets', {'icons': true})
)

// Settings for Multer Express middleware: Save uploaded images to /uploaded_assets
// With file name as current date and time and original file extension
const storage = multer.diskStorage({
  // Destination to store image     
  destination: 'uploaded_assets/', 
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});
var upload = multer({ storage: storage })

// Upload endpoint for Multer Express middleware
app.post('/upload', 
  upload.single('file'), 
  async (req, res, next) => {
    console.log(req.file, req.body)
    if (req.file) {
      const signedAsset = await signAssetBuffer(req.file.filename);
      res.set("Content-Type", signedAsset.mimeType);
      res.send(signedAsset.buffer);
    }
})

// Serve the app and listen on specified port
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
  console.log(`Load in your browser: http://localhost:${PORT}`);
});
