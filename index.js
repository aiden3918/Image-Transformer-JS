// user-imported image
let image = document.getElementById("user-image");

// canvas to read data and output new image
let canvas = document.getElementById("test");
let context = canvas.getContext("2d"); // IE9 exception

// settings and ui elements
let pixelCountSlider = document.getElementById("pixel-count-slider");
let pixelCountDisplay = document.getElementById("pixel-count-display");
let generateImageBtn = document.getElementById("generate-image-btn");

// obvious
updatePixelCountDisplay = (e) => pixelCountDisplay.innerText = String(e.target.value);

// display user-imported image
function displayImageFile(e) {
    image.style.width = "auto";
    image.style.height = "auto";

    console.log(e);
    // create url blob to display as image source
    let url = URL.createObjectURL(e.target.files[0]);
    image.src = url;

    // log some file data
    let filename = e.target.files[0].name;
    let filetype = filename.substring(filename.lastIndexOf("."), filename.length);
    console.log("filename: " + filename);
    console.log("file type: " + filetype);

    // << let filetype = image.src.substring(image.src.lastIndexOf("."), image.src.length); >>
    // << console.log(filetype); >>

    // resize image if too big
    setTimeout(() => { // ill turn these into async functions (when i figure out how) 
        if (image.width > 875) {
            image.style.width = "875px";
            image.style.height = "auto";
        } 
    
    }, 200);
    console.log("image.src: " + image.src);

    /* << setTimeout(() => {
        context.drawImage(image, 0, 0);
        let imageDataArr = context.getImageData(0, 0, image.width, image.height).data;

        // let rgbImageDataArr = imageDataArr.filter((element, index) => (index + 1) % 4 != 0); // filter every a value for rgba -> rgb
        console.log("image rgba data: ", imageDataArr);

        let width = image.width;
        let height = image.height;
        console.log("width: " + width);
        console.log("height: " + height);

        canvas.width = width;
        canvas.height = height;
    }, 300); >> */
}

// create new image on generate-image-btn click
generateImageBtn.onclick = () => generateImage(pixelCountSlider.value);

function generateImage(pixelCountWidth) {
    // get image data
    context.drawImage(image, 0, 0);
    let imageDataArr = context.getImageData(0, 0, image.width, image.height).data;
    // << let rgbImageDataArr = imageDataArr.filter((element, index) => (index + 1) % 4 != 0); // filter every a value for rgba -> rgb >>
    console.log("image rgba data: ", imageDataArr);

    // resize canvas
    let width = image.width;
    let height = image.height;

    console.log("width: " + width);
    console.log("height: " + height);

    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);

    let pixelSize = Math.floor(canvas.width / pixelCountWidth);
    console.log("pixelSize: " + pixelSize);

    // maybe round pixel rgb values before averaging? well see how it goes first
    // let roundedimageData = iamgeDataArr.map(e => )
    
    // "iterate" through all sections that will be simplified to one pixel
    // # of iterations vertically (height) calculated using aspect ratio
    for (let i = 0; i < Math.floor(pixelCountWidth * height / width); i++) {
        for (let j = 0; j < pixelCountWidth; j++) {
            let currentPixelAvgRGB = calculateAverageRGBValues(imageDataArr, j, i, pixelSize, pixelSize * pixelCountWidth);
            context.fillStyle = "rgba(" + currentPixelAvgRGB.toString() + ",255)";
            context.fillRect(j * pixelSize, i * pixelSize, pixelSize, pixelSize);
            console.log(currentPixelAvgRGB);
        }
    }
}

// average all rgba values for each "pixel"
// returns an array of the 
function calculateAverageRGBValues(imageDataAsArray, startingXPixel, startingYPixel, pixelSize, width) {
    let sum = 0;
    let avg = [0, 0, 0];

    let startingXIndexCorrelation = 4 * startingXPixel * pixelSize;
    let startingYIndexCorrelation = 4 * startingYPixel * width; 

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
        avg[i] = Math.round(sum / Math.pow(pixelSize, 2));
    }

    return avg;
}


/*function displayCanvasImage(url) {
    return new Promise (resolve => {
        image.src = url;
        c.drawImage(image, 0, 0);
        
        console.log(image.src);
        console.log(c.getImageData(0, 0, 500, 400).data);

        resolve("resolved");
    });
}

async function displayImageFile(e) {
    console.log(e);
    let url = URL.createObjectURL(e.target.files[0]);

    let canvasImage = await displayCanvasImage(url);
    console.log(canvasImage);

    // canvas.width = image.width;
    // canvas.height = image.height;

}*/