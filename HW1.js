'use strict';

const cv = require("opencv")
const utils = require("./utils")

function main () {

  cv.readImage(process.argv[2], function(err, inputMat){

    if(err || inputMat.height() == 0 || inputMat.width == 0) {
      console.log('input image error!')
      return
    }

    var upsideDown = inputMat.copy(),
        rightLeft = inputMat.copy(),
        diagonal = inputMat.copy(),
        height = inputMat.height(),
        width = inputMat.width()

    console.log("input image =", width, " x ",height)

    /**
     * Matrix(rows, cols)
     * Use matrix.pixel(ro, j) to get the pixel
     *     matrix.pixel(i, j, [r,g,b]) to set the pixel
     **/
    for (var i = 0; i < width; i++) {
      for (var j = 0; j < height; j++) {
        upsideDown.pixel(i, j, inputMat.pixel(height-i-1, j))
        rightLeft.pixel(i, j, inputMat.pixel(i, height-j-1))
        diagonal.pixel(i, j, inputMat.pixel(j, i)) //invert x and y
      }
    }

    upsideDown.save('./output/HW1/HW1_upside_down.bmp')
    rightLeft.save('./output/HW1/HW1_right_left.bmp')
    diagonal.save('./output/HW1/HW1_diagonal.bmp')
    console.log('finished!')
  })
}

main()