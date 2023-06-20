function linearRGB_from_sRGB(v) {
    var fv = v / 255.0;
    if (fv < 0.04045) return fv / 12.92;
    return Math.pow((fv + 0.055) / 1.055, 2.4);
}

function sRGB_from_linearRGB(v) {
    if (v <= 0.) return 0;
    if (v >= 1.) return 255;
    if (v < 0.0031308) return 0.5 + (v * 12.92 * 255);
    return 0 + 255 * (Math.pow(v, 1.0 / 2.4) * 1.055 - 0.055);
}

var sRGB_to_linearRGB_Lookup = Array(256);
(function () {
    var i;
    for (i = 0; i < 256; i++) {
        sRGB_to_linearRGB_Lookup[i] = linearRGB_from_sRGB(i);
    }
})();

function monochrome (srgb, k1, k2, k3) {
    var z = Math.round(sRGB_from_linearRGB(sRGB_to_linearRGB_Lookup[srgb[0]] * k1 + sRGB_to_linearRGB_Lookup[srgb[1]] * k2 + sRGB_to_linearRGB_Lookup[srgb[2]] * k3));
    return [z, z, z];
}

var sliderK1 = document.getElementById("sliderK1");
var sliderK2 = document.getElementById("sliderK2");
var sliderK3 = document.getElementById("sliderK3");

var valueK1 = document.getElementById("valK1");
var valueK2 = document.getElementById("valK2");
var valueK3 = document.getElementById("valK3");

var colorBar = document.getElementById("colorBar");
var monoChromeBar = document.getElementById("monoChromeBar");

colorBar.width = 800;
colorBar.height = 50;
monoChromeBar.width = 800;
monoChromeBar.height = 50;

var colorBarContext = colorBar.getContext('2d');
var gradient = colorBarContext.createLinearGradient(0, 0, colorBar.width, 0);
gradient.addColorStop(0, 'red');
gradient.addColorStop(0.14285, 'orange');
gradient.addColorStop(0.28571, 'yellow');
gradient.addColorStop(0.42857, 'lime');
gradient.addColorStop(0.57142, 'cyan');
gradient.addColorStop(0.71428, 'blue');
gradient.addColorStop(0.85714, 'magenta');
gradient.addColorStop(1, 'red');
colorBarContext.fillStyle = gradient;
colorBarContext.fillRect(0, 0, colorBar.width, colorBar.height);

var monoChromeBarContext = monoChromeBar.getContext('2d');

function updateMonoChrome() {
    let value1 = parseFloat(sliderK1.value);
    let value2 = parseFloat(sliderK2.value);
    let value3 = parseFloat(sliderK3.value);
    let total = value1 + value2 + value3;

    // Adjust other two sliders value proportional to their current value
    if (this === sliderK1) {
        sliderK2.value = value2 * (1 - value1) / (total - value1);
        sliderK3.value = value3 * (1 - value1) / (total - value1);
    } else if (this === sliderK2) {
        sliderK1.value = value1 * (1 - value2) / (total - value2);
        sliderK3.value = value3 * (1 - value2) / (total - value2);
    } else if (this === sliderK3) {
        sliderK1.value = value1 * (1 - value3) / (total - value3);
        sliderK2.value = value2 * (1 - value3) / (total - value3);
    }

    valueK1.innerText = sliderK1.value;
    valueK2.innerText = sliderK2.value;
    valueK3.innerText = sliderK3.value;

    // Update monochrome bar
    for (var x = 0; x < monoChromeBar.width; x++) {
        var colorData = colorBarContext.getImageData(x, 0, 1, 1).data;
        var srgb = [colorData[0], colorData[1], colorData[2]];
        var gray = monochrome(srgb, parseFloat(sliderK1.value), parseFloat(sliderK2.value), parseFloat(sliderK3.value));
        monoChromeBarContext.fillStyle = `rgb(${gray[0]}, ${gray[1]}, ${gray[2]})`;
        monoChromeBarContext.fillRect(x, 0, 1, monoChromeBar.height);
    }
}

sliderK1.oninput = updateMonoChrome;
sliderK2.oninput = updateMonoChrome;
sliderK3.oninput = updateMonoChrome;

var randomColors = document.getElementById("randomColors");
var grayColors = document.getElementById("grayColors");
var randomColorBlocks = [];

function generateRandomColor() {
    return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
}

function generateColorBlocks() {
    randomColors.innerHTML = '';
    grayColors.innerHTML = '';
    for (let i = 0; i < 20; i++) {
        var randomColor = generateRandomColor();
        var colorBlock = document.createElement('div');
        colorBlock.style.backgroundColor = randomColor;
        colorBlock.style.width = '50px';
        colorBlock.style.height = '50px';
        colorBlock.style.display = 'inline-block';
        randomColors.appendChild(colorBlock);

        randomColorBlocks.push(colorBlock);
    }
}

function updateGrayColors() {
    grayColors.innerHTML = '';
    for (let i = 0; i < randomColorBlocks.length; i++) {
        var colorData = randomColorBlocks[i].style.backgroundColor.match(/\d+/g).map(Number);
        var srgb = [colorData[0], colorData[1], colorData[2]];
        var gray = monochrome(srgb, parseFloat(sliderK1.value), parseFloat(sliderK2.value), parseFloat(sliderK3.value));
        var grayBlock = document.createElement('div');
        grayBlock.style.backgroundColor = `rgb(${gray[0]}, ${gray[1]}, ${gray[2]})`;
        grayBlock.style.width = '50px';
        grayBlock.style.height = '50px';
        grayBlock.style.display = 'inline-block';
        grayColors.appendChild(grayBlock);
    }
}

sliderK1.oninput = function() {
    updateMonoChrome();
    updateGrayColors();
};
sliderK2.oninput = function() {
    updateMonoChrome();
    updateGrayColors();
};
sliderK3.oninput = function() {
    updateMonoChrome();
    updateGrayColors();
};

updateMonoChrome();
generateColorBlocks();
updateGrayColors();
