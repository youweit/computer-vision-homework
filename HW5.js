'use strict'

const cv = require('opencv')
const utils = require('./utils')

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
    let height = inputMat.height()
    let width = inputMat.width()

    console.log('input image = ', width, ' x ', height)

    let octogonalKenel = [
      [-1, 0, 0, 0, -1],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [-1, 0, 0, 0, -1]
    ] // origin is 2,2,

    dilationMat = applyDilation(inputMat, new Kernel(octogonalKenel, {x: 2, y: 2}))
    dilationMat.save('./output/HW5/HW5_dilation.bmp')

    erosionMat = applyErosion(inputMat, new Kernel(octogonalKenel, {x: 2, y: 2}))
    erosionMat.save('./output/HW5/HW5_erosion.bmp')

    openingMat = applyOpening(inputMat, new Kernel(octogonalKenel, {x: 2, y: 2}))
    openingMat.save('./output/HW5/HW5_opening.bmp')

    closingMat = applyClosing(inputMat, new Kernel(octogonalKenel, {x: 2, y: 2}))
    closingMat.save('./output/HW5/HW5_closing.bmp')

    console.log('finished!')
  })
}

main()
