'use strict';

const cv = require('opencv')
const utils = require('./utils')

function applyDilation(inputMat) {

  let result = inputMat.copy()
  let whitePixel = [255, 255, 255]

  for (let i = 0; i < inputMat.width(); i++) {
    for (let j = 0; j < inputMat.height(); j++) {
      if (inputMat.pixelValueAt(i,j) == 255) {
        let pixelToChange = i
        for (let kernel = 0; kernel < 5; kernel++) {
          let k = pixelToChange + kernel
          if (k < inputMat.width()) {
            // result.pixel(k, 10, [255, 0, 0])
          }
        }
        // for (let kernel = 0; kernel < 5; kernel++) {
        //   let k = pixelToChange + kernel
        //   if (k < inputMat.height()) {
        //     result.pixel(i, k, whitePixel)
        //   }
        // }
      }
    }
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
