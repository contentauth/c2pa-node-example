# C2PA Node.js example 

[This repository](https://github.com/contentauth/c2pa-node-example) is an example of a very simple app that uses [Express](https://expressjs.com/) and the CAI Node.js library to upload images and add a C2PA manifest to each image.  It is written in TypeScript, HTML, and CSS to be as generic as possible.

The client JavaScript code simply displays information from the manifests.

NOTE: We may want to move to plain JavaScript to make it as accessible as possible.

## Install and build

Follow these steps:

1. Install Node.js and npm from <https://nodejs.org/en/download>.
1. Clone this repo by entering this command in a terminal window:
    ```
    git clone https://github.com/contentauth/c2pa-node-example.git
    ```
1. Open a terminal window and install the required packages. Enter these commands
    ```
    cd <path_where_you_cloned_repo>/c2pa-node-example
    npm install
    ```
1. Start the service by entering this command:
    ```
    npm start
    ```
    You'll see this in your terminal:
    ```
    > c2pa_serve@0.1.0 start
    > nodemon server.js

    [nodemon] 2.0.21
    [nodemon] to restart at any time, enter `rs`
    [nodemon] watching path(s): *.*
    [nodemon] watching extensions: js,mjs,json
    [nodemon] starting `node server.js`
    CAI HTTP server listening on port 8000.
    ```

## Try the web app

**NOTE: This is based on the old Node example and needs to be updated to reflect the new implementation.**

1. Open a browser to <http://localhost:8000>.
1. Click the **Choose Files** button and select one or more JPEG or PNG images in the native file chooser dialog. 
    <br/>The service uploads the selected images, stores them in the `uploads` folder, and then calls the c2patool to add a C2PA manifest to each image. 
3. Hover over the badge for information about the associated manifest.
4. The service returns the full-sized image, not thumbnails.
5. Right-click and download an image to view the credentials on <https://verify.contentauthenticity.org/>.

### Overview of the app

The code in `server.js` contains all the server-side logic.  It defines these routes:

- POST `/upload` uploads a file, adds a C2PA manifest, and returns a URL.
- GET `/`, the default route, serves `client/index.html`, which is a simple page with a user interface you can use to upload one or more files.  The associated client JavaScript is in [`client/index.js`](https://github.com/contentauth/c2pa-node-example/blob/main/client/index.js).  Selecting files triggers a [client JavaScript event listener](https://github.com/contentauth/c2pa-node-example/blob/main/client/index.js#L89) that calls the `/upload` route for each file and then calls the [`addGalleryItem`](https://github.com/contentauth/c2pa-node-example/blob/main/client/index.js#L19) function to display the returned image on the page.

## Customizing

The data added to the manifest is determined by the `manifest.json` file in the root folder. To modify the information added to the file, modify `manifest.json`.





