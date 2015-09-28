var cv = require("opencv"),
    utils = require("./utils")

function main () {

  //read lena image from the file system using opencv
  cv.readImage('image/lena.bmp', function(err, inputMat){

    var binary = inputMat.copy(),
        height = inputMat.height(),
        width = inputMat.width(),
        binaryThreshold = 128,
        histogramMax = 0,
        histogramData = new Uint16Array(256)

    console.log("input image =", width, " x ",height)
    /**
     * Use matrix.pixel(i, j) to get the pixel
     *     matrix.pixel(i, j, [r,g,b]) to set the pixel
     **/
    for (var i = 0; i < width; i++) {
      for (var j = 0; j < height; j++) {
        var pixel = inputMat.pixel(i, j)
        //calculate histogram
        var value = pixel[0]
        histogramData[value]++
        if (histogramData[value] > histogramMax) {
          histogramMax = histogramData[value]
        }
        //apply binary for threshold
        pixel = value < binaryThreshold ? [0, 0, 0]: [255, 255, 255]
        binary.pixel(i, j, pixel)
      }
    }

    var histogram = new cv.Matrix(256, 256, cv.Constants.CV_8U)
    //draw histogram
    for (var x = 0; x < histogram.width(); x++) {
      for(var y = 0; y < histogram.height(); y++) {
        // console.log(histogramData[x]/histogramMax*256)
        if (histogram.height() - y >= histogramData[x]/histogramMax*histogram.height()) {
          histogram.pixel(y, x, [255, 255, 255])
        } else {
          histogram.pixel(y, x, [0, 0, 0])
        }
      }
    }
    binary.save('./output/HW2/HW2_binary.bmp')
    histogram.save('./output/HW2/HW2_histogram.bmp')
    console.log('finished!')
    utils.showMatrixOnWindow(histogram)
  })
}
main()
