'use strict';

const cv = require('opencv')
const utils = require('./utils')

function Kernel(kernel, origin) {
  this.kernel = kernel
  this.origin = origin

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
  let pixelsToModify = []

  for (let i = 0; i < inputMat.height(); i++) { //this is image height
    for (let j = 0; j < inputMat.width(); j++) { //this is image width
      if (inputMat.pixelValueAt(i,j) == whitePixel[0]) {
        for (let kernelIndex = 0; kernelIndex < kernel.points.length; kernelIndex++) {
          if (j + kernel.points[kernelIndex].x >= 0 && j + kernel.points[kernelIndex].x <= inputMat.width() 
            && i + kernel.points[kernelIndex].y >= 0 && i + kernel.points[kernelIndex].y <= inputMat.height()) {
            pixelsToModify.push({row: i + kernel.points[kernelIndex].y, col: j + kernel.points[kernelIndex].x})
          }
        }
      }
    }
  }

  //apply the effect
  for (let pixel of pixelsToModify) {
    result.pixel(pixel.row, pixel.col, whitePixel)
  }

  return result
}

function main() {
  //read lena image from the file system using opencv
  cv.readImage(process.argv[2], function(err, inputMat) {

    if(err || inputMat.height() == 0 || inputMat.width == 0) {
      console.log('input image error!')
      return
    }

    var dilationMat = inputMat.copy(), 
        erosion = inputMat.copy(),
        opening = inputMat.copy(),
        closing = inputMat.copy(),
        height = inputMat.height(),
        width = inputMat.width(),
        totalPixels = height * width
    console.log('input image = ', width, ' x ',height)

    let octogonalKenel = [
      [0,1,1,1,0],
      [1,1,1,1,1],
      [1,1,1,1,1],
      [1,1,1,1,1],
      [0,1,1,1,0]
    ] //center is 2,2,

    //convert the input image to binary.
    inputMat = utils.binarized(inputMat)

    dilationMat = applyDilation(inputMat, new Kernel(octogonalKenel, {x: 2, y: 2}))
    dilationMat.save('./output/HW4/HW4_dilation.bmp')
    utils.showMatrixOnWindow(dilationMat)
  })
}


main()
