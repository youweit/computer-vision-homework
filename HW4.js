'use strict';

const cv = require('opencv')
const utils = require('./utils')

const whitePixel = [255, 255, 255]
const blackPixel = [0, 0, 0]


function Kernel(kernel, origin) {
  this.kernel = kernel
  this.origin = origin

  //this calcutate the relative postition for the kernel. only present the 1 one.
  this.points = []
  for (let x = 0; x < kernel.length; x++) {
    for (let y = 0; y < kernel[x].length; y++) {
      if (kernel[x][y] == 1) {
        this.points.push({x: (x - origin.x), y: (y - origin.y)})
      }
    }
  }
  return this
}

function applyDilation(inputMat, kernel) {

  let result = inputMat.copy()
  let whitePixel = [255, 255, 255]
  
  for (let i = 0; i < inputMat.height(); i++) { //this is image height
    for (let j = 0; j < inputMat.width(); j++) { //this is image width
      if (inputMat.pixelValueAt(i,j) == whitePixel[0]) {
        for (let kernelIndex = 0; kernelIndex < kernel.points.length; kernelIndex++) {
          let x = j + kernel.points[kernelIndex].x
          let y = i + kernel.points[kernelIndex].y
          if (x >= 0 && x <= inputMat.width() && y >= 0 && y <= inputMat.height()) {
            result.pixel(y, x, whitePixel)
          }
        }
      }
    }
  }
  

  return result
}

function applyErosion(inputMat, kernel) {

  let result = inputMat.copy()

  for (let i = 0; i < inputMat.height(); i++) { //this is image height
    for (let j = 0; j < inputMat.width(); j++) { //this is image width
      if (inputMat.pixelValueAt(i,j) === whitePixel[0]) {
        let erosion = true
        for (let kernelIndex = 0; kernelIndex < kernel.points.length; kernelIndex++) {
          let x = j + kernel.points[kernelIndex].x
          let y = i + kernel.points[kernelIndex].y

          if (x >= 0 && x <= inputMat.width() && y >= 0 && y <= inputMat.height()) {
            //pixelValueAt(col, row)
            if (inputMat.pixelValueAt(y,x) !== whitePixel[0]) {
              erosion = false
              break;
            }
          } else {
            erosion = false
          }
        }
        if (erosion) {
          result.pixel(i, j, whitePixel)
        } else {
          result.pixel(i, j, blackPixel)
        }
      }
    }
  }
  return result
}


function applyOpening(inputMat, kernel) {
  return applyDilation(applyErosion(inputMat, kernel), kernel)
}

function applyClosing(inputMat, kernel) {
  return applyErosion(applyDilation(inputMat, kernel), kernel)
}

function applyReverse(inputMat) {
  let result = inputMat.copy()
  let whitePixel = [255, 255, 255]
  let blackPixel = []
  for (let i = 0; i < inputMat.height(); i++) { //this is image height
    for (let j = 0; j < inputMat.width(); j++) { //this is image width
      if (inputMat.pixelValueAt(i,j) == 255) {
        result.pixel(i, j, blackPixel)
      } else {
        result.pixel(i, j, whitePixel)
      }
    }
  }
  return result
}

function intersect(matA, matB) {
  let result = matA.copy()

  for (let i = 0; i < matA.height(); i++) { //this is image height
    for (let j = 0; j < matA.width(); j++) { //this is image width
      if (matA.pixelValueAt(i,j) == matB.pixelValueAt(i,j)) {
        result.pixel(i, j, whitePixel)
      } else {
        result.pixel(i, j, blackPixel)
      }
    }
  }

  return result
}

function applyHitAndMiss(inputMat, kernelJ, kernelK) {

  return intersect(applyErosion(inputMat, kernelJ), applyErosion(applyReverse(inputMat), kernelK))
}

function main() {
  //read lena image from the file system using opencv
  cv.readImage(process.argv[2], function(err, inputMat) {

    if(err || inputMat.height() == 0 || inputMat.width == 0) {
      console.log('input image error!')
      return
    }

    var dilationMat = inputMat.copy(), 
        erosionMat = inputMat.copy(),
        openingMat = inputMat.copy(),
        closingMat = inputMat.copy(),
        hitAndMissMat = inputMat.copy(),
        height = inputMat.height(),
        width = inputMat.width(),
        totalPixels = height * width
    console.log('input image = ', width, ' x ',height)

    let octogonalKenel = [
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0]
    ] //origin is 2,2,

    //convert the input image to binary.
    inputMat = utils.binarized(inputMat)

    dilationMat = applyDilation(inputMat, new Kernel(octogonalKenel, {x: 2, y: 2}))
    dilationMat.save('./output/HW4/HW4_dilation.bmp')

    erosionMat = applyErosion(inputMat, new Kernel(octogonalKenel, {x: 2, y: 2}))
    erosionMat.save('./output/HW4/HW4_erosion.bmp')

    openingMat = applyOpening(inputMat, new Kernel(octogonalKenel, {x: 2, y: 2}))
    openingMat.save('./output/HW4/HW4_opening.bmp')

    closingMat = applyClosing(inputMat, new Kernel(octogonalKenel, {x: 2, y: 2}))
    closingMat.save('./output/HW4/HW4_closing.bmp')

    let kernelJ = [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 0]
    ]

    let kernelK = [
      [0, 1, 1],
      [0, 0, 1],
      [0, 0, 0]
    ]

    hitAndMissMat = applyHitAndMiss(inputMat, new Kernel(kernelJ, {x: 1, y: 1}), new Kernel(kernelK, {x: 1, y: 1}))
    hitAndMissMat.save('./output/HW4/HW4_HitAndMiss.bmp')
    utils.showMatrixOnWindow(hitAndMissMat)
  })
}


main()
