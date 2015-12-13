'use strict'

const cv = require('opencv')
const fs = require('fs')
const utils = require('./utils')
const BLACK = 0
const WHITE = 255

function Kernel (kernel, origin) {
  this.kernel = kernel
  this.origin = origin
  this.points = []

  for (let y = 0; y < kernel.length; y++) {
    for (let x = 0; x < kernel[y].length; x++) {
      if (kernel[y][x] >= 0) {
        this.points.push({x: (x - origin.x), y: (y - origin.y)})
      }
    }
  }
  return this
}

function applyDilation (inputMat, kernel) {
  let result = inputMat.copy()

  for (let i = 0; i < inputMat.height(); i++) { // row
    for (let j = 0; j < inputMat.width(); j++) { // column
      let localMax = 0
      for (let kernelIndex = 0; kernelIndex < kernel.points.length; kernelIndex++) {
        let x = j + kernel.points[kernelIndex].x
        let y = i + kernel.points[kernelIndex].y
        if (x >= 0 && x <= inputMat.width() && y >= 0 && y <= inputMat.height()) {
          localMax = Math.max(localMax, inputMat.pixelValueAt(y, x))
        }
      }
      result.pixel(i, j, [localMax, localMax, localMax])
    }
  }

  return result
}

function applyErosion (inputMat, kernel) {
  let result = inputMat.copy()

  for (let i = 0; i < inputMat.height(); i++) { // row
    for (let j = 0; j < inputMat.width(); j++) { // column
      let localMin = 255
      for (let kernelIndex = 0; kernelIndex < kernel.points.length; kernelIndex++) {
        let x = j + kernel.points[kernelIndex].x
        let y = i + kernel.points[kernelIndex].y

        if (x >= 0 && x <= inputMat.width() && y >= 0 && y <= inputMat.height()) {
          localMin = Math.min(localMin, inputMat.pixelValueAt(y, x))
        }
      }
      result.pixel(i, j, [localMin, localMin, localMin])
    }
  }
  return result
}

function applyOpening (inputMat, kernel) {
  return applyDilation(applyErosion(inputMat, kernel), kernel)
}

function applyClosing (inputMat, kernel) {
  return applyErosion(applyDilation(inputMat, kernel), kernel)
}

function applyClosingThenOpening (inputMat, kernel) {
  console.log('applyClosingThenOpening')
  return applyOpening(applyClosing(inputMat, kernel), kernel)
}

function applyOpeningThenClosing (inputMat, kernel) {
  console.log('applyOpeningThenClosing')
  return applyClosing(applyOpening(inputMat, kernel), kernel)
}

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

function calculateSNR (originalMat, noiseMat) {
  let originPixel = originalMat.copy()
  let noisePixel = noiseMat.copy()
  let size = originalMat.width() * originalMat.height()
  let us = 0
  let vs = 0
  let un = 0
  let vn = 0

  for (let i = 0; i < originalMat.height(); i++) { // row
    for (let j = 0; j < originalMat.width(); j++) { // column
      us += originPixel.pixelValueAt(i, j)
    }
  }
  us /= size

  for (let i = 0; i < originalMat.height(); i++) { // row
    for (let j = 0; j < originalMat.width(); j++) { // column
      vs += Math.pow(originPixel.pixelValueAt(i, j) - us, 2)
    }
  }
  vs /= size

  for (let i = 0; i < originalMat.height(); i++) { // row
    for (let j = 0; j < originalMat.width(); j++) { // column
      un += noisePixel.pixelValueAt(i, j) - originPixel.pixelValueAt(i, j)
    }
  }
  un /= size

  for (let i = 0; i < originalMat.height(); i++) { // row
    for (let j = 0; j < originalMat.width(); j++) { // column
      vn += Math.pow(noisePixel.pixelValueAt(i, j) - originPixel.pixelValueAt(i, j) - un, 2)
    }
  }
  vn /= size
  let value = 20 * Math.log10(Math.sqrt(vs / vn))
  console.log('SNR = ', value, 'us =', us, 'vs =', vs, 'un =', un, 'vn =', vn)
  return value
}

function main () {
  // read lena image from the file system using opencv
  cv.readImage(process.argv[2], function (err, inputMat) {
    if (err || inputMat.height() === 0 || inputMat.width === 0) {
      console.log('input image error!')
      return
    }

    let kernel = new Kernel([
      [-1, 0, 0, 0, -1],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [-1, 0, 0, 0, -1]
    ], {x: 2, y: 2}) // origin is 2,2

    let outputDirectory = './output/HW8/'
    let stream = fs.createWriteStream(outputDirectory + 'SNR.txt')

    let gaussian30Mat = applyGaussianNoise(inputMat, 30)
    let gaussian10Mat = applyGaussianNoise(inputMat, 10)

    let saltAndPepper005Mat = applySaltAndPepper(inputMat, 0.05)
    let saltAndPepper01Mat = applySaltAndPepper(inputMat, 0.1)

    gaussian30Mat.save(outputDirectory + 'HW8_gaussian_30.bmp')
    gaussian10Mat.save(outputDirectory + 'HW8_gaussian_10.bmp')
    saltAndPepper005Mat.save(outputDirectory + 'HW8_salt_and_pepper_005.bmp')
    saltAndPepper01Mat.save(outputDirectory + 'HW8_salt_and_pepper_01.bmp')

    stream.write('gaussian 10: ' + calculateSNR(inputMat, gaussian10Mat) + '\n')
    stream.write('gaussian 30: ' + calculateSNR(inputMat, gaussian30Mat) + '\n')
    stream.write('salt and pepper 0.05: ' + calculateSNR(inputMat, saltAndPepper005Mat) + '\n')
    stream.write('salt and pepper 0.1: ' + calculateSNR(inputMat, saltAndPepper01Mat) + '\n')

    // Box 3x3
    let box33Gaussian10Mat = applyBoxFilter(gaussian10Mat, 3, 3)
    let box33Gaussian30Mat = applyBoxFilter(gaussian30Mat, 3, 3)
    let box33salt005Mat = applyBoxFilter(saltAndPepper005Mat, 3, 3)
    let box33salt01Mat = applyBoxFilter(saltAndPepper01Mat, 3, 3)

    box33Gaussian10Mat.save(outputDirectory + 'HW8_box_33_gaussian_10.bmp')
    box33Gaussian30Mat.save(outputDirectory + 'HW8_box_33_gaussian_30.bmp')
    box33salt005Mat.save(outputDirectory + 'HW8_box_33_salt_and_pepper_005.bmp')
    box33salt01Mat.save(outputDirectory + 'HW8_box_33_salt_and_pepper_01.bmp')

    stream.write('box 3x3 gaussian 10: ' + calculateSNR(inputMat, box33Gaussian10Mat) + '\n')
    stream.write('box 3x3 gaussian 30: ' + calculateSNR(inputMat, box33Gaussian30Mat) + '\n')
    stream.write('box 3x3 salt and pepper 0.05: ' + calculateSNR(inputMat, box33salt005Mat) + '\n')
    stream.write('box 3x3 salt and pepper 0.1: ' + calculateSNR(inputMat, box33salt01Mat) + '\n')

    // Box 5x5
    let box55Gaussian10Mat = applyBoxFilter(gaussian10Mat, 5, 5)
    let box55Gaussian30Mat = applyBoxFilter(gaussian30Mat, 5, 5)
    let box55salt005Mat = applyBoxFilter(saltAndPepper005Mat, 5, 5)
    let box55salt01Mat = applyBoxFilter(saltAndPepper01Mat, 5, 5)

    box55Gaussian10Mat.save(outputDirectory + 'HW8_box_55_gaussian_10.bmp')
    box55Gaussian30Mat.save(outputDirectory + 'HW8_box_55_gaussian_30.bmp')
    box55salt005Mat.save(outputDirectory + 'HW8_box_55_salt_and_pepper_005.bmp')
    box55salt01Mat.save(outputDirectory + 'HW8_box_55_salt_and_pepper_01.bmp')

    stream.write('box 5x5 gaussian 10: ' + calculateSNR(inputMat, box55Gaussian10Mat) + '\n')
    stream.write('box 5x5 gaussian 30: ' + calculateSNR(inputMat, box55Gaussian30Mat) + '\n')
    stream.write('box 5x5 salt and pepper 0.05: ' + calculateSNR(inputMat, box55salt005Mat) + '\n')
    stream.write('box 5x5 salt and pepper 0.1: ' + calculateSNR(inputMat, box55salt01Mat) + '\n')

    // Median 3x3
    let median33Gaussian10Mat = applyMedianFilter(gaussian10Mat, 3, 3)
    let median33Gaussian30Mat = applyMedianFilter(gaussian30Mat, 3, 3)
    let median33salt005Mat = applyMedianFilter(saltAndPepper005Mat, 3, 3)
    let median33salt01Mat = applyMedianFilter(saltAndPepper01Mat, 3, 3)

    median33Gaussian10Mat.save(outputDirectory + 'HW8_median_33_gaussian_10.bmp')
    median33Gaussian30Mat.save(outputDirectory + 'HW8_median_33_gaussian_30.bmp')
    median33salt005Mat.save(outputDirectory + 'HW8_median_33_salt_and_pepper_005.bmp')
    median33salt01Mat.save(outputDirectory + 'HW8_median_33_salt_and_pepper_01.bmp')

    stream.write('median 3x3 gaussian 10: ' + calculateSNR(inputMat, median33Gaussian10Mat) + '\n')
    stream.write('median 3x3 gaussian 30: ' + calculateSNR(inputMat, median33Gaussian30Mat) + '\n')
    stream.write('median 3x3 salt and pepper 0.05: ' + calculateSNR(inputMat, median33salt005Mat) + '\n')
    stream.write('median 3x3 salt and pepper 0.1: ' + calculateSNR(inputMat, median33salt01Mat) + '\n')

    // Median 5x5
    let median55Gaussian10Mat = applyMedianFilter(gaussian10Mat, 5, 5)
    let median55Gaussian30Mat = applyMedianFilter(gaussian30Mat, 5, 5)
    let median55salt005Mat = applyMedianFilter(saltAndPepper005Mat, 5, 5)
    let median55salt01Mat = applyMedianFilter(saltAndPepper01Mat, 5, 5)

    median55Gaussian10Mat.save(outputDirectory + 'HW8_median_55_gaussian_10.bmp')
    median55Gaussian30Mat.save(outputDirectory + 'HW8_median_55_gaussian_30.bmp')
    median55salt005Mat.save(outputDirectory + 'HW8_median_55_salt_and_pepper_005.bmp')
    median55salt01Mat.save(outputDirectory + 'HW8_median_55_salt_and_pepper_01.bmp')

    stream.write('median 5x5 gaussian 10: ' + calculateSNR(inputMat, median55Gaussian10Mat) + '\n')
    stream.write('median 5x5 gaussian 30: ' + calculateSNR(inputMat, median55Gaussian30Mat) + '\n')
    stream.write('median 5x5 salt and pepper 0.05: ' + calculateSNR(inputMat, median55salt005Mat) + '\n')
    stream.write('median 5x5 salt and pepper 0.1: ' + calculateSNR(inputMat, median55salt01Mat) + '\n')

    let closingThenOpeningSaltAndPepper005Mat = applyClosingThenOpening(saltAndPepper005Mat, kernel)
    let closingThenOpeningSaltAndPepper01Mat = applyClosingThenOpening(saltAndPepper01Mat, kernel)
    let closingThenOpeningGaussian30Mat = applyClosingThenOpening(gaussian30Mat, kernel)
    let closingThenOpeningGaussian10Mat = applyClosingThenOpening(gaussian10Mat, kernel)

    closingThenOpeningSaltAndPepper005Mat.save(outputDirectory + 'HW8_closing_then_opening_salt_and_pepper_005.bmp')
    closingThenOpeningSaltAndPepper01Mat.save(outputDirectory + 'HW8_closing_then_opening_salt_and_pepper_01.bmp')
    closingThenOpeningGaussian30Mat.save(outputDirectory + 'HW8_closing_then_opening_gaussian_30.bmp')
    closingThenOpeningGaussian10Mat.save(outputDirectory + 'HW8_closing_then_opening_gaussian_10.bmp')

    stream.write('closing then opening gaussian 10: ' + calculateSNR(inputMat, closingThenOpeningGaussian10Mat) + '\n')
    stream.write('closing then opening gaussian 30: ' + calculateSNR(inputMat, closingThenOpeningGaussian30Mat) + '\n')
    stream.write('closing then opening salt and pepper 0.05: ' + calculateSNR(inputMat, closingThenOpeningSaltAndPepper005Mat) + '\n')
    stream.write('closing then opening salt and pepper 0.1: ' + calculateSNR(inputMat, closingThenOpeningSaltAndPepper01Mat) + '\n')

    let openingThenClosingSaltAndPepper005Mat = applyOpeningThenClosing(saltAndPepper005Mat, kernel)
    let openingThenClosingSaltAndPepper01Mat = applyOpeningThenClosing(saltAndPepper01Mat, kernel)
    let openingThenClosingGaussian30Mat = applyOpeningThenClosing(gaussian30Mat, kernel)
    let openingThenClosingGaussian10Mat = applyOpeningThenClosing(gaussian10Mat, kernel)

    openingThenClosingSaltAndPepper005Mat.save(outputDirectory + 'HW8_opening_then_closing_salt_and_pepper_005.bmp')
    openingThenClosingSaltAndPepper01Mat.save(outputDirectory + 'HW8_opening_then_closing_salt_and_pepper_01.bmp')
    openingThenClosingGaussian30Mat.save(outputDirectory + 'HW8_opening_then_closing_gaussian_30.bmp')
    openingThenClosingGaussian10Mat.save(outputDirectory + 'HW8_opening_then_closing_gaussian_10.bmp')

    stream.write('opening then closing gaussian 10: ' + calculateSNR(inputMat, openingThenClosingGaussian10Mat) + '\n')
    stream.write('opening then closing gaussian 30: ' + calculateSNR(inputMat, openingThenClosingGaussian30Mat) + '\n')
    stream.write('opening then closing salt and pepper 0.05: ' + calculateSNR(inputMat, openingThenClosingSaltAndPepper005Mat) + '\n')
    stream.write('opening then closing salt and pepper 0.1: ' + calculateSNR(inputMat, openingThenClosingSaltAndPepper01Mat) + '\n')
    console.log('finished')
  })
}

main()
