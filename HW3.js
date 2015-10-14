var cv = require("opencv"),
    utils = require("./utils")

function main() {

  //read lena image from the file system using opencv
  cv.readImage('image/lena.bmp', function(err, inputMat){

    var darkerLena = inputMat.copy(),
        equalizedLena = inputMat.copy(),
        height = inputMat.height(),
        width = inputMat.width(),
        totalPixels = height * width
    console.log("input image =", width, " x ",height)

    //make a dark image of lena by divided by 3.
    for (var i = 0; i < width; i++) {
      for (var j = 0; j < height; j++) {
        //calculate histogram
        var value = inputMat.pixelValueAt(i,j)
        //apply binary for threshold
        pixel = value / 3
        darkerLena.pixel(i, j, [pixel, pixel, pixel])
      }
    }

    drawHistogram(darkerLena, 'darkerLena')

    for (var i = 0; i < width; i++) {
      for (var j = 0; j < height; j++) {
        //calculate histogram
        var value = inputMat.pixelValueAt(i,j)
        var k = 0
        for (var i = 0; i < width; i++) {
          for (var j = 0; j < height; j++) {
            if (darkerLena.pixelValueAt(i,j) < value) k++
          }
        }

        value = k / totalPixels * 255
        equalizedLena.pixel(i, j, [value, value, value])
      }
    }

    drawHistogram(equalizedLena, 'equalizedLena')
    // binary.save('./output/HW2/HW2_connected_component.bmp')
    console.log('finished!')
    utils.showMatrixOnWindow(equalizedLena)
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
  }
}

main()
