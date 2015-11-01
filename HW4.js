'use strict'

const cv = require('opencv')
const utils = require('./utils')

const whitePixel = [255, 255, 255]
const blackPixel = [0, 0, 0]

function Kernel (kernel, origin) {
  this.kernel = kernel
  this.origin = origin
  this.points = []

  // array[y][x], y is the first array, x is the second.
  for (let y = 0; y < kernel.length; y++) {
    for (let x = 0; x < kernel[y].length; x++) {
      if (kernel[y][x] === 1) {
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
      if (inputMat.pixelValueAt(i, j)) {
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

function applyErosion (inputMat, kernel) {
  let result = inputMat.copy()

  for (let i = 0; i < inputMat.height(); i++) { // row
    for (let j = 0; j < inputMat.width(); j++) { // column
      let erosion = true
      for (let kernelIndex = 0; kernelIndex < kernel.points.length; kernelIndex++) {
        let x = j + kernel.points[kernelIndex].x
        let y = i + kernel.points[kernelIndex].y

        if (x >= 0 && x <= inputMat.width() && y >= 0 && y <= inputMat.height()) {
          // pixelValueAt(col, row)
          if (!inputMat.pixelValueAt(y, x)) {
            erosion = false
            break
          }
        } else {
          erosion = false
          break
        }
      }
      if (erosion) {
        result.pixel(i, j, whitePixel)
      } else {
        result.pixel(i, j, blackPixel)
      }
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

function applyReverse (inputMat) {
  let result = inputMat.copy()

  for (let i = 0; i < inputMat.height(); i++) { // row
    for (let j = 0; j < inputMat.width(); j++) { // column
      if (inputMat.pixelValueAt(i, j)) {
        result.pixel(i, j, blackPixel)
      } else {
        result.pixel(i, j, whitePixel)
      }
    }
  }

  return result
}

function intersect (matA, matB) {
  let result = matA.copy()

  for (let i = 0; i < matA.height(); i++) { // row
    for (let j = 0; j < matA.width(); j++) { // column
      if (matA.pixelValueAt(i, j) & matB.pixelValueAt(i, j)) {
        result.pixel(i, j, whitePixel)
      } else {
        result.pixel(i, j, blackPixel)
      }
    }
  }

  return result
}

function applyHitAndMiss (inputMat, J, K) {
  return intersect(applyErosion(inputMat, J), applyErosion(applyReverse(inputMat), K))
}

function main () {
  
  // read lena image from the file system using opencv
  cv.readImage(process.argv[2], function (err, inputMat) {
    if (err || inputMat.height() === 0 || inputMat.width === 0) {
      console.log('input image error!')
      return
    }

    let dilationMat = inputMat.copy()
    let erosionMat = inputMat.copy()
    let openingMat = inputMat.copy()
    let closingMat = inputMat.copy()
    let hitAndMissMat = inputMat.copy()
    let height = inputMat.height()
    let width = inputMat.width()

    console.log('input image = ', width, ' x ', height)

    let octogonalKenel = [
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0]
    ] // origin is 2,2,

    let L = [
      [1, 1],
      [0, 1]
    ]

    // convert the input image to binary.
    inputMat = utils.binarized(inputMat)

    // inputMat.save('./output/HW4/HW4_binary.bmp')
    dilationMat = applyDilation(inputMat, new Kernel(octogonalKenel, {x: 2, y: 2}))
    dilationMat.save('./output/HW4/HW4_dilation.bmp')

    erosionMat = applyErosion(inputMat, new Kernel(octogonalKenel, {x: 2, y: 2}))
    erosionMat.save('./output/HW4/HW4_erosion.bmp')

    openingMat = applyOpening(inputMat, new Kernel(octogonalKenel, {x: 2, y: 2}))
    openingMat.save('./output/HW4/HW4_opening.bmp')

    closingMat = applyClosing(inputMat, new Kernel(octogonalKenel, {x: 2, y: 2}))
    closingMat.save('./output/HW4/HW4_closing.bmp')

    let kernelJ = new Kernel(L, {x: 1, y: 0})
    let kernelK = new Kernel(L, {x: 0, y: 1})

    console.log(kernelJ)
    console.log(kernelK)
    hitAndMissMat = applyHitAndMiss(inputMat, kernelJ, kernelK)
    hitAndMissMat.save('./output/HW4/HW4_hitAndMiss.bmp')

    console.log('finished!')
    utils.showMatrixOnWindow(hitAndMissMat)
  })
}

main()
