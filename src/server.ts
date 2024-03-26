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

// Use Multer Express middleware with memory storage to put image in buffer 
const storage = multer.memoryStorage()
var upload = multer({ storage: storage })

app.use(cors());

// Serve the index.html file
app.get("/", async (req, res) => {
  res.sendFile(path.resolve(fileURLToPath(import.meta.url), "../index.html"));
});

/* 
  Uploads the file using Multer Express middleware, signs the buffer, and then saves it on the server. 
*/
app.post('/upload', 
  upload.single('file'), 
  async (req, res, next) => {
    //console.log(req.file, req.body)

    if (req.file) {
      const fileExtension = req.file.mimetype.split("/")[1];
      const originalBaseFileName = req.file.originalname.split(".")[0];

      // Save the signed file to the uploaded_assets directory
      // With file name of original file name plus current date and time (for uniqueness) and extension based on MIME type
      const signedAsset = await signAssetBuffer(req.file, manifestFile); 
      await fs.writeFile(`${uploadDir}/${originalBaseFileName}_${Date.now()}.${fileExtension}`, signedAsset.buffer);

      res.set("Content-Type", signedAsset.mimeType);
      res.send(signedAsset.buffer);
      
      // res.format({'text/html': function(){
      //   res.send(`<h1>IMAGE</h1><img src="${uploadDir}/${originalBaseFileName}_${Date.now()}.${fileExtension}">`);
      //   }
      // })

    }
})

/* 
  Uploads the file using Multer Express middleware, then signs and saves a copy of the file.  NOTE: This results in two copies of the file on the server, one signed and one unsigned.
*/
app.post('/upload_file_sign', 
  upload.single('file'), 
  async (req, res, next) => {
    //console.log(req.file, req.body)

    if (req.file) {
      const fileExtension = req.file.mimetype.split("/")[1];
      const baseFileName = req.file.originalname.split(".")[0];
      const unsignedFilePath = `${uploadDir}/${baseFileName}_${Date.now()}.${fileExtension}`;

      // Save the file to the uploaded_assets directory BEFORE signing
      // With file name of original file name plus current date and time (for uniqueness) and extension based on MIME type
      await fs.writeFile(unsignedFilePath, req.file.buffer);
      console.log(`File saved to ${unsignedFilePath} Now calling signFile()...`);
      
      const signedAsset = await signFile(unsignedFilePath, manifestFile); 

      res.set("Content-Type", req.file.mimetype);
      res.send(req.file.buffer);
    }
})


// Serve the listing of uploaded assets
app.use('/assets', 
  express.static(uploadDir),  
  serveIndex(uploadDir, {'icons': true})
)

// Serve the app and listen on specified port
app.listen(PORT, () => {
  //console.log(`Listening on port ${PORT}`);
  console.log(`Load in your browser: http://localhost:${PORT}`);
});
