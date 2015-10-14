var cv = require("opencv")
    utils = require("./utils")

function main() {

  //read lena image from the file system using opencv
  cv.readImage(process.argv[2], function(err, inputMat){

    if(err || inputMat.height() == 0 || inputMat.width == 0) {
      console.log('input image error!')
      return
    }

    var darkerLena = inputMat.copy(),
        equalizedLena = inputMat.copy(),
        height = inputMat.height(),
        width = inputMat.width(),
        totalPixels = height * width
    console.log("input image =", width, " x ",height)

    // make a dark image of lena by divided by 3.
    for (var i = 0; i < width; i++) {
      for (var j = 0; j < height; j++) {
        pixel = inputMat.pixelValueAt(i,j) / 3
        darkerLena.pixel(i, j, [pixel, pixel, pixel])
      }
    }

    var accumulated = drawHistogram(darkerLena, 'darkerLena')

    for (var i = 0; i < width; i++) {
      for (var j = 0; j < height; j++) {
        //calculate histogram
        var value = accumulated[darkerLena.pixelValueAt(i,j)] / totalPixels * 255
        equalizedLena.pixel(i, j, [value, value, value])
      }
    }

    drawHistogram(equalizedLena, 'equalizedLena')
    console.log('finished!')
  })

  function drawHistogram(mat, fileName){
    var histogramMax = 0,
        histogramData = new Uint32Array(256)
    var histogram = new cv.Matrix(256, 256, cv.Constants.CV_8U)


    for (var i = 0; i < mat.width(); i++) {
      for (var j = 0; j < mat.height(); j++) {
        //calculate histogram
        var value = mat.pixelValueAt(i,j)
        histogramData[value]++
        if (histogramData[value] > histogramMax) {
          histogramMax = histogramData[value]
        }
      }
    }

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
    
    mat.save('./output/HW3/HW3_'+fileName+'.bmp')
    histogram.save('./output/HW3/HW3_'+fileName+'_histogram.bmp')

    //calculate the cdf of each gray level.
    for (var i = 1; i < 256; i++) {
      histogramData[i] += histogramData[i-1]
    }

    return histogramData
  }
}

main()
