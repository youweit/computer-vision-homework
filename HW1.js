var cv = require("opencv"),
    utils = require("./utils")

function main () {

  //read lena image from the file system using opencv
  cv.readImage('image/lena.bmp', function(err, inputMat){

    var upsideDown = inputMat.copy(),
        rightLeft = inputMat.copy(),
        diagonal = inputMat.copy(),
        height = inputMat.height(),
        width = inputMat.width()

    console.log("input image =", width, " x ",height)

    /**
     * Use matrix.pixel(i, j) to get the pixel
     *     matrix.pixel(i, j, [r,g,b]) to set the pixel
     **/
    for (var i = 0; i < height; i++) {
      for (var j = 0; j < width; j++) {
        upsideDown.pixel(i, j, inputMat.pixel(height-i-1, j))
        rightLeft.pixel(i, j, inputMat.pixel(i, height-j-1))
        diagonal.pixel(i, j, inputMat.pixel(j, i)) //invert x and y
      }
    }

    upsideDown.save('./output/HW1/HW1_upside_down.bmp')
    rightLeft.save('./output/HW1/HW1_right_left.bmp')
    diagonal.save('./output/HW1/HW1_diagonal.bmp')
    console.log('finished!')
    // utils.showMatrixOnWindow(diagonal)
  })
}

main()