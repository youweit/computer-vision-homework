'use strict';

const cv = require('opencv')
const utils = require('./utils')

function applyDilation(inputMat) {

  let result = inputMat.copy()
  let whitePixel = [255, 255, 255]
  let pixelsToModefy = []

  for (let i = 0; i < inputMat.height(); i++) {
    for (let j = 0; j < inputMat.width(); j++) {
      if (inputMat.pixelValueAt(i,j) == whitePixel[0]) {
        let pixelToChange = {row: i, col: j}
        
        //apply 1,1,5,1,1 kernel

        for (let kernel = 0; kernel < 5; kernel++) {
          let k = pixelToChange.col + kernel
          if (k < inputMat.width()) {
            pixelsToModefy.push({row: i, col: k})
          }
        }

        for (let kernel = 0; kernel < 5; kernel++) {
          let k = pixelToChange.row + kernel
          if (k < inputMat.width()) {
            pixelsToModefy.push({row: k, col: j})
          }
        }
      }
    }
  }

  //apply the effect
  for (let pixel of pixelsToModefy) {
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

    //convert the input image to binary.
    inputMat = utils.binarized(inputMat)

    dilationMat = applyDilation(inputMat)

    utils.showMatrixOnWindow(dilationMat)
  })
}


main()
