##Thinning

###Getting Started

1. Install `Node.js`(4.0+), `npm` and `OpenCV`(version 2.3.1 above). 

2. Navigate to the project directory and install the dependencies with command.

```
$ npm install
```
  3. Run the program.```
$ node HW8.js lena.bmp
```

> There is a capability issue when using `Node.js`(4.0+) with `node-opencv` package, to fix this problem please reference [Possibly incompatible with nodeJS 4.0.0 ? #293](https://github.com/peterbraden/node-opencv/issues/293), or download node_modules here: [node_modules.zip](https://www.dropbox.com/s/fvgq8id4aj7sjnk/M10409304_node_modules.zip?dl=0), decompress and put at the root of the project folder.

###Structure
```
.├── HW8.js                                       #Program├── M10409304_HW8_report.pdf                     #Report├── package.json                                 #Dependencies├── results                                      #Output images└── utils.js                                     #Utilities
```

<div style="page-break-after: always;"></div>

###Principal Code Fragment

Gaussian noise filter 

```javascript
function applyGaussianNoise (inputMat, amplitude) {
  let gaussianMat = inputMat.copy()
  for (let i = 0; i < inputMat.height(); i++) { // row
    for (let j = 0; j < inputMat.width(); j++) { // column
      let noiseValue = gaussianMat.pixelValueAt(i, j) + amplitude * randomGauss()
      if (noiseValue > WHITE) {
        noiseValue = WHITE
      } else if (noiseValue < BLACK) {
        noiseValue = BLACK
      }
      gaussianMat.pixel(i, j, [noiseValue, noiseValue, noiseValue])
    }
  }
  return gaussianMat
}

function randomGauss () {
  let a
  let b = 0
  for (a = 0; a < 12; a++) {
    b += Math.random()
  }
  return b - 6
}
```

<div style="page-break-after: always;"></div>

Salt and pepper

```javascript
function applySaltAndPepper (inputMat, threshold) {
  let saltPepperMat = inputMat.copy()
  for (let i = 0; i < inputMat.height(); i++) { // row
    for (let j = 0; j < inputMat.width(); j++) { // column
      let random = Math.random()
      if (random < threshold) {
        saltPepperMat.pixel(i, j, [BLACK, BLACK, BLACK])
      } else if (random > 1 - threshold) {
        saltPepperMat.pixel(i, j, [WHITE, WHITE, WHITE])
      }
    }
  }
  return saltPepperMat
}
```

<div style="page-break-after: always;"></div>

Box filter

```javascript
function applyBoxFilter (inputMat, boxWidth, boxHeight) {
  let boxFilterMat = inputMat.copy()
  let bounds = {
    x: Math.floor(boxWidth / 2),
    y: Math.floor(boxHeight / 2)
  }
  console.log('applying box filter', boxHeight, 'x', boxHeight)
  for (let i = 0; i < inputMat.height(); i++) { // row
    for (let j = 0; j < inputMat.width(); j++) { // column
      let boxList = []
      let localOrigin = {
        x: j - bounds.x,
        y: i - bounds.y
      }
      for (let m = 0; m < boxHeight; m++) { // row
        for (let n = 0; n < boxWidth; n++) { // column
          let result = {
            x: localOrigin.x + n,
            y: localOrigin.y + m
          }
          if (result.x >= 0 && result.x < boxFilterMat.width() && result.y >= 0 && result.y < boxFilterMat.height()) {
            boxList.push(inputMat.pixelValueAt(result.y, result.x))
          }
        }
      }
      let value = boxList.reduce(function (a, b) {
        return a + b
      }) / boxList.length

      boxFilterMat.pixel(i, j, [value, value, value])
    }
  }
  return boxFilterMat
}
```

<div style="page-break-after: always;"></div>

Median filter

```javascript
function median (values) {
  values.sort(function (a, b) {
    return a - b
  })
  var half = Math.floor(values.length / 2)
  if (values.length % 2) {
    return values[half]
  } else {
    return (values[half - 1] + values[half]) / 2.0
  }
}

function applyMedianFilter (inputMat, boxWidth, boxHeight) {
  let medianFilterMat = inputMat.copy()
  let bounds = {
    x: Math.floor(boxWidth / 2),
    y: Math.floor(boxHeight / 2)
  }
  console.log('applying median filter', boxHeight, 'x', boxHeight)
  for (let i = 0; i < inputMat.height(); i++) { // row
    for (let j = 0; j < inputMat.width(); j++) { // column
      let boxList = []
      let localOrigin = {
        x: j - bounds.x,
        y: i - bounds.y
      }
      for (let m = 0; m < boxHeight; m++) { // row
        for (let n = 0; n < boxWidth; n++) { // column
          let result = {
            x: localOrigin.x + n,
            y: localOrigin.y + m
          }
          if (result.x >= 0 && result.x < inputMat.width() && result.y >= 0 && result.y < inputMat.height()) {
            boxList.push(inputMat.pixelValueAt(result.y, result.x))
          }
        }
      }
      let medianValue = median(boxList)
      medianFilterMat.pixel(i, j, [medianValue, medianValue, medianValue])
    }
  }
  return medianFilterMat
}
```

<div style="page-break-after: always;"></div>

###Results

####Gaussian Noise, Amplitude = 10

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_gaussian_10.bmp"/>
    <span class="caption">Gaussian Noise Image</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_box_33_gaussian_10.bmp"/>
    <span class="caption">Box Filter 3x3</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_box_55_gaussian_10.bmp"/>
    <span class="caption">Box Filter 5x5</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_median_33_gaussian_10.bmp"/>
    <span class="caption">Median Filter 3x3</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_median_55_gaussian_10.bmp"/>
    <span class="caption">Median Filter 5x5</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_closing_then_opening_gaussian_10.bmp"/>
    <span class="caption">Closing then opening</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_opening_then_closing_gaussian_10.bmp"/>
    <span class="caption">Opening then closing</span>
</div>

####Gaussian Noise, Amplitude = 30

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_gaussian_30.bmp"/>
    <span class="caption">Gaussian Noise Image</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_box_33_gaussian_30.bmp"/>
    <span class="caption">Box Filter 3x3</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_box_55_gaussian_30.bmp"/>
    <span class="caption">Box Filter 5x5</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_median_33_gaussian_30.bmp"/>
    <span class="caption">Median Filter 3x3</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_median_55_gaussian_30.bmp"/>
    <span class="caption">Median Filter 5x5</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_closing_then_opening_gaussian_30.bmp"/>
    <span class="caption">Closing then opening</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_opening_then_closing_gaussian_30.bmp"/>
    <span class="caption">Opening then closing</span>
</div>

####Salt and pepper, threshold = 0.05

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_salt_and_pepper_005.bmp"/>
    <span class="caption">Gaussian Noise Image</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_box_33_salt_and_pepper_005.bmp"/>
    <span class="caption">Box Filter 3x3</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_box_55_salt_and_pepper_005.bmp"/>
    <span class="caption">Box Filter 5x5</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_median_33_salt_and_pepper_005.bmp"/>
    <span class="caption">Median Filter 3x3</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_median_55_salt_and_pepper_005.bmp"/>
    <span class="caption">Median Filter 5x5</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_closing_then_opening_salt_and_pepper_005.bmp"/>
    <span class="caption">Closing then opening</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_opening_then_closing_salt_and_pepper_005.bmp"/>
    <span class="caption">Opening then closing</span>
</div>

####Salt and pepper, threshold = 0.1

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_salt_and_pepper_01.bmp"/>
    <span class="caption">Gaussian Noise Image</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_box_33_salt_and_pepper_01.bmp"/>
    <span class="caption">Box Filter 3x3</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_box_55_salt_and_pepper_01.bmp"/>
    <span class="caption">Box Filter 5x5</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_median_33_salt_and_pepper_01.bmp"/>
    <span class="caption">Median Filter 3x3</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_median_55_salt_and_pepper_01.bmp"/>
    <span class="caption">Median Filter 5x5</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_closing_then_opening_salt_and_pepper_01.bmp"/>
    <span class="caption">Closing then opening</span>
</div>

<div class="item">
    <img src="https://raw.githubusercontent.com/youweit/CV-homework/master/output/HW8/HW8_opening_then_closing_salt_and_pepper_01.bmp"/>
    <span class="caption">Opening then closing</span>
</div>

<div style="page-break-after: always;"></div>

###SNR

```
gaussian 10: 13.60921599175628
gaussian 30: 4.182741876086615
salt and pepper 0.05: 0.9259515279560584
salt and pepper 0.1: -2.060158118782916
box 3x3 gaussian 10: 17.756078811225336
box 3x3 gaussian 30: 12.611261234760327
box 3x3 salt and pepper 0.05: 9.469199944478522
box 3x3 salt and pepper 0.1: 6.398933213767304
box 5x5 gaussian 10: 14.872396921778606
box 5x5 gaussian 30: 13.296103383102928
box 5x5 salt and pepper 0.05: 11.180377526726808
box 5x5 salt and pepper 0.1: 8.594781408607913
median 3x3 gaussian 10: 17.645277349135558
median 3x3 gaussian 30: 11.020428130414645
median 3x3 salt and pepper 0.05: 19.36685967557611
median 3x3 salt and pepper 0.1: 15.402028252114883
median 5x5 gaussian 10: 15.992435638165015
median 5x5 gaussian 30: 12.856337161892835
median 5x5 salt and pepper 0.05: 16.381047106806648
median 5x5 salt and pepper 0.1: 15.775080750602433
closing then opening gaussian 10: 7.398665648876519
closing then opening gaussian 30: 5.865396354007051
closing then opening salt and pepper 0.05: 3.976246967686112
closing then opening salt and pepper 0.1: -2.908870019374372
opening then closing gaussian 10: 8.32511568816399
opening then closing gaussian 30: 8.378431163743672
opening then closing salt and pepper 0.05: 4.431798194028847
opening then closing salt and pepper 0.1: -2.239921302669426

```