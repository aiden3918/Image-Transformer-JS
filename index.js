// user-imported image
const image = document.getElementById("user-image");
const imageUploadInput = document.getElementById("image-upload");

// canvas to read data and output new image
const canvas = document.getElementById("new-image-canvas");
const context = canvas.getContext("2d", {willReadFrequently: true}); // IE9 exception

// settings and ui elements
const pixelCountSlider = document.getElementById("pixel-count-slider");
const pixelCountDisplay = document.getElementById("pixel-count-display");
const generateImageBtn = document.getElementById("generate-image-btn");
const filterType = document.getElementById("filter");

const pixelSizeDisplay = document.getElementById("pixel-size");
const predictedNewImageDimensionsDisplay = document.getElementById("new-dimensions");
const leftoverPixelsDisplay = document.getElementById("runoff-pixels");
const imageDimensionsText = document.getElementById("image-dimensions");

const saveBtn = document.getElementById("save-btn");
const printBtn = document.getElementById("print-btn");

const modal = document.getElementById("modal");

const downloadLink = document.getElementById("download-link");

const supportedFileTypes = [".png", ".jpg", ".jpeg", ".webp", ".pjp", ".jfif", ".pjpeg"];

// obvious
updatePixelCountDisplay = (e) => {
    pixelCountDisplay.innerText = String(e.target.value);
    updateOtherInfo();
}

onFilterChange = (e) => {
    console.log(e);
    console.log(e.target.value);
    let pixelSettings = document.getElementsByClassName("pixel-settings");
    switch (e.target.value) {
        case "pixel":
            for (let i = 0; i < pixelSettings.length; i++) pixelSettings[i].style.display = "block";
            break;
        case "invert":
        case "greyscale":
            for (let i = 0; i < pixelSettings.length; i++) pixelSettings[i].style.display = "none";
            break;
    }
} 

// create new image on generate-image-btn click
generateImageBtn.onclick = () => checkConditions(Number(pixelCountSlider.value));
saveBtn.onclick = () => saveImage();
printBtn.onclick = () => window.print();

// display user-imported image
function displayImageFile(e) {
    if (!checkFileType(e)) return;
    console.log("event: ", e);

    // create url blob to display as image source
    let url = URL.createObjectURL(e.target.files[0]);
    image.src = url;

    console.log("image.src: " + image.src);
    image.onload = () => {
        image.style.width = image.naturalWidth + "px";
        image.style.height = image.naturalHeight + "px";
        imageDimensionsText.innerText = "Dimensions: " + image.width + " x " + image.height;
        updateOtherInfo();
    }
}

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

function updateOtherInfo() {
    let pixelSize = Math.floor(image.width / Number(pixelCountSlider.value));
    let newWidth = pixelSize * pixelCountSlider.value;
    pixelSizeDisplay.innerText = "Predicted Pixel Size: " + pixelSize;
    predictedNewImageDimensionsDisplay.innerText = "Predicted New Image Dimensions: " + newWidth + " x " + Math.floor(newWidth * image.height / image.width);
    leftoverPixelsDisplay.innerText = (image.width - newWidth) + "px off the right, " + (image.height - Math.floor(newWidth * image.height / image.width)) + "px off the bottom";
}

function checkConditions(pixelCountWidth) { 
    if (image.src == 'http://127.0.0.1:5500/index.htm') alert("Please upload an image.");
    else generateImage(pixelCountWidth);
}

function generateImage(pixelCountWidth) {
    // show modal
    modal.style.display = "block";

    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    // // reset image size
    // image.style.width = "auto"
    // image.style.height = "auto";

    canvas.width = image.width;
    canvas.height = image.height;
    
    // get image data
    context.drawImage(image, 0, 0); // drawing natural image, not client image
    let imageData = context.getImageData(0, 0,  canvas.width, canvas.height);

    switch (filterType.value) {
        case "pixel": 
            if (pixelCountWidth >= image.width) alert("Please adjust the slider so that the desired width (in pixels) of the new image is LESS THAN the width of the original image.");
            else pixelateImage(pixelCountWidth);
            break;
        case "invert": invertImage(imageData); break;
        case "greyscale": greyscaleImage(imageData); break;
    }

    modal.style.display = "none";
}

function pixelateImage(pixelCountWidth) {
    //"size" of pixels
    const pixelSize = Math.floor(image.width / pixelCountWidth);
    console.log("pixelSize: " + pixelSize);

    // resize image and canvas
    image.style.width = (pixelSize * pixelCountWidth) + "px";
    image.style.height = "auto";

    canvas.width = image.clientWidth
    canvas.height = image.clientHeight;

    // get image data
    context.drawImage(image, 0, 0); // drawing natural image, not client image
    let imageDataArr = context.getImageData(0, 0,  canvas.width, canvas.height).data;
    console.log("image rgba data: ", imageDataArr);
    
    // "iterate" through all sections that will be simplified to one pixel
    // # of iterations vertically (height) calculated using aspect ratio
    for (let i = 0; i < pixelCountWidth * image.naturalHeight / image.naturalWidth; i++) {
        for (let j = 0; j < pixelCountWidth; j++) {
            let currentPixelAvgRGB = calculateAverageRGBValues(imageDataArr, j, i, pixelSize, canvas.width);

            context.fillStyle = "rgba(" + currentPixelAvgRGB.toString() + ",255)";
            context.fillRect(j * pixelSize, i * pixelSize, pixelSize, pixelSize);
        }
    }

    image.style.width = image.naturalWidth + "px";
    image.style.height = image.naturalHeight + "px";

    let newImageDataArr = context.getImageData(0, 0,  canvas.width, canvas.height).data;
    console.log("new image rgba data: ", newImageDataArr);
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

function invertImage(imageData) {
    console.log("imagedata: ", imageData);
    for (let i = 0; i < imageData.data.length; i++) {
        if ((i + 1) % 4 != 0) imageData.data[i] = 255 - imageData.data[i];
    }
    console.log("inverted image data: ", imageData);
    context.putImageData(imageData, 0, 0);
}

function greyscaleImage(imageData) {
    console.log("imagedata: ", imageData);
    let greyscaleAvg = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
        greyscaleAvg = Math.round(imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = greyscaleAvg;
    }
    console.log("greyscaled image data: ", imageData);
    context.putImageData(imageData, 0, 0);
}

function saveImage() {
    let currentDate = `${String((date.getMonth() + 1)).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${date.getFullYear()}`;
    let currentTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

    let importFileName = imageUploadInput.files[0].name;
    downloadLink.setAttribute('download', `${importFileName.substring(0 , importFileName.lastIndexOf("."))} ${currentDate} ${currentTime}.png`);
    downloadLink.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
    downloadLink.click();
}

let date = new Date();
console.log(`${String((date.getMonth() + 1)).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${date.getFullYear()}`);

console.log(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
