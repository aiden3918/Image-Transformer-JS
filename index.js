// user-imported image
let image = document.getElementById("user-image");
let imageUploadInput = document.getElementById("image-upload");

// canvas to read data and output new image
let canvas = document.getElementById("test");
let context = canvas.getContext("2d", {willReadFrequently: true}); // IE9 exception

// settings and ui elements
let pixelCountSlider = document.getElementById("pixel-count-slider");
let pixelCountDisplay = document.getElementById("pixel-count-display");
let generateImageBtn = document.getElementById("generate-image-btn");

let modal = document.getElementById("modal");

let supportedFileTypes = [".png", ".jpg", ".jpeg", ".webp", ".pjp", ".jfif", ".pjpeg"];

// obvious
updatePixelCountDisplay = (e) => pixelCountDisplay.innerText = String(e.target.value);

// check
function checkFileType(event) {
    // log some file data
    let filename = event.target.files[0].name;
    let filetype = filename.substring(filename.lastIndexOf("."), filename.length);
    console.log("filename: " + filename);
    console.log("file type: " + filetype);
    
    // check for unsupported file types
    if (!supportedFileTypes.includes(filetype)) {
        alert("Please upload a supported file type.");
        event.value = null;
        return false;
    } 

    return true;
}
// display user-imported image
function displayImageFile(e) {
    if (!checkFileType(e)) return;
    console.log(e);

    // create url blob to display as image source
    let url = URL.createObjectURL(e.target.files[0]);
    image.src = url;

    console.log("image.src: " + image.src);
    console.log("image width: " + image.width + " image height: " + image.height);
}

// create new image on generate-image-btn click
generateImageBtn.onclick = () => checkConditions(Number(pixelCountSlider.value));

function checkConditions(pixelCountWidth) {
    if (pixelCountWidth >= image.width) alert("Please adjust the slider so that the desired width (in pixels) of the new image is LESS THAN the width of the original image.");    
    else if (image.src == 'http://127.0.0.1:5500/index.htm') alert("Please upload an image.");
    else generateImage(pixelCountWidth);
}

function generateImage(pixelCountWidth) {
    // show modal
    modal.style.display = "block";

    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    //"size" of pixels
    let pixelSize = Math.floor(image.width / pixelCountWidth);
    console.log("pixelSize: " + pixelSize);

    // resize canvas to fit # of pixels exactly
    let originalImageWidth = image.width;
    let originalImageHeight = image.height;

    image.width = pixelSize * pixelCountWidth;
    image.style.height = "auto";
    console.log("canvas width: " + canvas.width + "      canvas height: " + canvas.height);

    // get image data
    context.drawImage(image, 0, 0);
    let imageDataArr = context.getImageData(0, 0,  canvas.width, canvas.height).data;
    // << let rgbImageDataArr = imageDataArr.filter((element, index) => (index + 1) % 4 != 0); // filter every a value for rgba -> rgb >>
    console.log("image rgba data: ", imageDataArr);

    // maybe round pixel rgb values before averaging? well see how it goes first
    // let roundedimageData = iamgeDataArr.map(e => )
    
    // "iterate" through all sections that will be simplified to one pixel
    // # of iterations vertically (height) calculated using aspect ratio
    for (let i = 0; i < canvas.height; i++) {
        for (let j = 0; j < canvas.width; j++) {
            let currentPixelAvgRGB = calculateAverageRGBValues(imageDataArr, j, i, pixelSize, canvas.width);

            context.fillStyle = "rgba(" + currentPixelAvgRGB.toString() + ",255)";
            context.fillRect(j * pixelSize, i * pixelSize, pixelSize, pixelSize);
        }
    }

    let newImageDataArr = context.getImageData(0, 0,  canvas.width, canvas.height).data;
    console.log("new image rgba data: ", newImageDataArr);

    image.width = originalImageWidth;
    image.height = originalImageHeight;

    modal.style.display = "none";
}

function pixelateImage(pixelCountWidth, imageDataArr) {
    console.log("to be continued...");
}

// average all rgba values for each "pixel"
// returns an array of the rgb values of the entire cell to be turned into a single-color pixel
// do this for every single cell of the array
// i think this is o(n) time complexity despite the 3 nested loops lols but i could be wrong
function calculateAverageRGBValues(imageDataAsArray, startingXPixel, startingYPixel, pixelSize, width) {
    let sum = 0;
    let avg = [0, 0, 0];

    // x and y abstraction used to represent the starting index of each respective cell in the image data array
    let startingXIndexCorrelation = 4 * startingXPixel * pixelSize;
    let startingYIndexCorrelation = 4 * startingYPixel * width * pixelSize; 

    // repeat this for r, g, and b values
    for (let i = 0 ; i < 3; i++) {
        sum = 0;
        // j represents the current row of the current cell
        for (let j = 0; j < pixelSize; j++) { 
            // k represents the current "column" of the current cell (skips 4 each time because array presents all image data as 1D array [r1, g1, b1, a1, r2, g2, b2, a2...]);
            // skip 4 to get add either r, g, b, or a value every time
            for (let k = 0; k < pixelSize; k++) { // row
                sum += imageDataAsArray[startingXIndexCorrelation + startingYIndexCorrelation + i + (4*k) + (4*width*j)]; //SOMETHING TO DO WITH STARTX AND STARTY
            }
        }
        // avg out and put it in single array
        avg[i] = Math.round(sum / (Math.pow(pixelSize, 2)));
    }

    return avg;
}

// sometimes it bugs out on the first or second try, probably need async implementation to fix that (or more settimeouts lol)
// need async or promise based for getting image array AFTER image resizing
// need async on generateImage so it runs synchronously (ironic)

/*async function generateImage(pixelCountWidth) {
    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // get image data
    context.drawImage(image, 0, 0);
    let imageDataArr = context.getImageData(0, 0, image.width, image.height).data;
    // << let rgbImageDataArr = imageDataArr.filter((element, index) => (index + 1) % 4 != 0); // filter every a value for rgba -> rgb >>
    console.log("image rgba data: ", imageDataArr);

    // resize canvas
    canvas.width = image.width;
    canvas.height = image.height;
    console.log("width: " + canvas.width);
    console.log("height: " + canvas.height);

    //"size" of pixels
    let pixelSize = Math.floor(canvas.width / pixelCountWidth);
    console.log("pixelSize: " + pixelSize);

    // maybe round pixel rgb values before averaging? well see how it goes first
    // let roundedimageData = iamgeDataArr.map(e => )
    
    // "iterate" through all sections that will be simplified to one pixel
    // # of iterations vertically (height) calculated using aspect ratio
    let maxX = Math.floor(width / pixelSize);
    let maxY = Math.floor(maxX * height / width);

    for (let i = 0; i < maxY; i++) {
        for (let j = 0; j < maxX; j++) {
            let currentPixelAvgRGB = calculateAverageRGBValues(imageDataArr, j, i, pixelSize, width);

            context.fillStyle = "rgba(" + currentPixelAvgRGB.toString() + ",255)";
            context.fillRect(j * pixelSize, i * pixelSize, pixelSize, pixelSize);
        }
    }
}*/

// change img width and height so that pixelated image fills entire screen

/*
greyscale:
for (let i = 0; i < imageDataArr.length; i += 4) {
    avg = (imageDataArr[i] + imageDataArr[i + 1] + imageDataArr[i + 2] + ) / 3
    imageDataArr[i], imageDataArr[i + 1], imageDataArr[i + 2] = avg, avg, avg;
}

invert:
for (let i = 0; i < imageDataArr.length; i++) {
    if (i % 4 != 0) imageDataArr[i] = 255 - imageDataArr[i];
}
*/