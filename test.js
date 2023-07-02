let jimmy = document.getElementById("jimmy");
let canvas = document.getElementById("test-canvas");

let context = canvas.getContext('2d');

console.log("jimmy: "+  jimmy.width + " x " + jimmy.height); // 197 x 255

let copy = new Image(100, 200);
copy.src = jimmy.src;

console.log("copy: "+  copy.width + " x " + copy.height);
console.log(copy.src)
copy.style.display = "block";

context.drawImage(copy, 0, 0);
console.log(context.getImageData(0, 0, copy.width, copy.height));