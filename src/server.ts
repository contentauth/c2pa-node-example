import express from "express";
import path from "path";
import serveIndex from 'serve-index';
import multer from 'multer';
import cors from "cors";
import fs from 'fs/promises';

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

// Serve the listing of uploaded assets
app.use('/assets', 
  express.static('uploaded_assets'), 
  serveIndex('uploaded_assets', {'icons': true})
)

// Use Multer Express middleware with memory storage to put image in buffer 
const storage = multer.memoryStorage()
var upload = multer({ storage: storage })

// The /upload endpoint uploads the file using Multer Express middleware, signs it, and then saves it on the server 
app.post('/upload', 
  upload.single('file'), 
  async (req, res, next) => {
    console.log(req.file, req.body)

    if (req.file) {
      const signedAsset = await signAssetBuffer(req.file.buffer, req.file.mimetype);
      res.set("Content-Type", signedAsset.mimeType);
      res.send(signedAsset.buffer);

      // Save the file to the uploaded_assets directory
      // With file name as current date and time and file extension based on MIME type
      const fileExtension = req.file.mimetype.split("/")[1];
      await fs.writeFile(`uploaded_assets/${Date.now()}.${fileExtension}`, signedAsset.buffer);
    }
})

// Serve the app and listen on specified port
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
  console.log(`Load in your browser: http://localhost:${PORT}`);
});
