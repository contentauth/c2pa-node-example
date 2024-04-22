# C2PA Node.js example 

[This repository](https://github.com/contentauth/c2pa-node-example) is an example of a very simple app that uses [Express](https://expressjs.com/) and the CAI Node.js library to upload images and add a C2PA manifest to each image.  It is written in TypeScript, HTML, and CSS to be as generic as possible.

The client JavaScript code simply displays information from the manifests.

NOTE: We may want to move to plain JavaScript to make it as accessible as possible.

## Install and build

Follow these steps:

1. Install Node.js and npm from <https://nodejs.org/en/download>.  **NOTE**: This app requires at least Node.js v20.x.
1. Clone this repo by entering this command in a terminal window:
    ```
    git clone https://github.com/contentauth/c2pa-node-example.git
    ```
1. Open a terminal window and install the required packages:
    ```
    cd <path_where_you_cloned_repo>/c2pa-node-example
    npm install
    ```
1. Start the Node.js app by entering this command:
    ```
    npm start
    ```
    You'll see this in your terminal:
    ```
    c2pa-node-example-v2@1.0.0 start
    > node  --loader ts-node/esm src/server.ts

    ...

    Load in your browser: http://localhost:3000
    ```

NOTE: You can ignore the warning.

## Try the web app

1. Open a browser to <http://localhost:3000>.
1. Click the first **Choose File** button:
    - Select a JPEG or PNG image file using the native file chooser dialog. 
    - When you click **Upload**, the app calls the [`/upload` route](#post-upload), which  attaches the manifest and signs the file using the test certificate while the image is in memory, then saves the file with Content Credentials to the `uploaded_images` directory.
1. Click the second **Choose File** button:
    - Select an image file using the native file chooser dialog. 
    - When you click **Upload**, the app calls the [`/upload_file_sign` route](#post-upload_file_sign), which uploads the selected image to the `uploaded_images` directory, attaches the manifest and signs the file using the test certificate, saving the signed file.  
    - This results in two files: the original file without Content Credentials and the signed file with Content Credentials.

## Overview of the app

The code in `server.ts` uses Express to define the routes described below.  It calls functions defined in `c2pa.ts` that use the C2PA Node library.

### GET `/`

The default route, which serves `client/index.html`, the app's web page that enables the user to call the other routes by submitting forms or clicking a link.

### POST `/upload`

- Uploads the selected image using `multer` middleware with `MemoryStorage` storage engine.
- Calls `signAssetBuffer` to attach the manifest to the image in the memory buffer and then sign the image in the buffer with the test certificate.
- Saves the buffer to a file in the `uploaded_images` directory, prepending the original file name with a unique number based on the current date/time; for example, `1713507142037_foo.jpeg`.
- Displays in the console the URL to inspect the signed image using Verify.  
- On Mac OS, Cmd-double-click to open the URL in your default browser.  Or copy/paste the URL into your browser location bar.

### POST `/upload_file_sign`

- Uploads the selected image using `multer` middleware with `DiskStorage` storage engine and saves it to the `uploaded_images` directory, prepending the original file name with a unique number based on the current date/time; for example, `1713507142037_foo.jpeg`.
- Displays in the console the URL to inspect the unsigned image using Verify.
- Calls `signFile` to attach the manifest to the file, sign the image with the test certificate, and save the signed image to the `uploaded_images` directory, prepending the original file name with `signed` and then a unique number based on the current date/time; for example, `signed_1713507142037_foo.jpeg`.
- Displays in the console the URL to inspect the signed image using Verify.
- On Mac OS, Cmd-double-click to open the URL in your default browser.  Or copy/paste the URL into your browser location bar.

### GET `/assets`

Serves a generic listing of all files in the `uploaded_assets` directory, using `serveIndex` middleware.

## Manifest

The manifest store file is `manifest1.json` in the `manifests` folder.  Both routes attach this manifest to the uploaded asset before signing it with the test certificate.




