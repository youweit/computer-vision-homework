'use strict';

var cv = require("opencv")

cv.Matrix.prototype.pixelValueAt = function(i,j) {
  return this.pixel(i,j)[0]
}

exports.showMatrixOnWindow = function(mat) {
  var window = new cv.NamedWindow('HOMEWORK QAQ', 0);
  window.show(mat);
  window.blockingWaitKey(0, 90000);
}

exports.applyGrayscale = function(mat) {

  let grayScaleMat = mat.copy()

  for (var i = 0; i < mat.height(); i++) {
    for (var j = 0; j < mat.width(); j++) {
      //apply binary for threshold 128
      let grayPixel = mat.pixel(i,j)[0] * 0.0722  + mat.pixel(i,j)[1] * 0.7152 + mat.pixel(i,j)[2] * 0.2126
      grayScaleMat.pixel(i, j, [grayPixel, grayPixel, grayPixel])
    }
  }
  return grayScaleMat
}

exports.binarized = function(mat) {

  let binary = mat.copy()
  let black = [0, 0, 0]
  let white = [255, 255, 255]
  for (var i = 0; i < mat.height(); i++) {
    for (var j = 0; j < mat.width(); j++) {
      //apply binary for threshold 128
      let pixel = mat.pixelValueAt(i,j) < 128 ? black: white
      binary.pixel(i, j, pixel)
    }
  }
  return binary
}

exports.drawHistogram = function(mat, fileName){
  
  //input must be a grey scale image.
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
