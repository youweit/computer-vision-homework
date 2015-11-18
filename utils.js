'use strict'

const cv = require('opencv')

// a convenience function gor getting the pixel gray value 0 ~ 255
cv.Matrix.prototype.pixelValueAt = function (row, col) {
  if (!this.pixel(row, col)[0]) {
    return this.pixel(row, col)
  } else {
    return this.pixel(row, col)[0]
  }
}

exports.showMatrixOnWindow = function (mat) {
  let window = new cv.NamedWindow('HOMEWORK QAQ', 0)
  window.show(mat)
  window.blockingWaitKey(0, 90000)
}

exports.applyGrayscale = function (mat) {
  let grayScaleMat = mat.copy()

  for (let i = 0; i < mat.height(); i++) {
    for (let j = 0; j < mat.width(); j++) {
      // apply binary for threshold 128
      let grayPixel = mat.pixel(i, j)[0] * 0.0722 + mat.pixel(i, j)[1] * 0.7152 + mat.pixel(i, j)[2] * 0.2126
      grayScaleMat.pixel(i, j, [grayPixel, grayPixel, grayPixel])
    }
  }
  return grayScaleMat
}

exports.binarized = function (mat) {
  let binary = mat.copy()
  let black = [0, 0, 0]
  let white = [255, 255, 255]
  console.log('binarizing ', mat.width(), 'x', mat.height(), 'image')
  for (let i = 0; i < mat.height(); i++) {
    for (let j = 0; j < mat.width(); j++) {
      // apply binary for threshold 128
      let pixel = mat.pixelValueAt(i, j) < 128 ? black : white
      binary.pixel(i, j, pixel)
    }
  }
  return binary
}

exports.drawHistogram = function (mat, fileName) {
  // input must be a grey scale image.
  let histogramMax = 0
  let histogramData = new Uint32Array(256)
  let histogram = new cv.Matrix(256, 256, cv.Constants.CV_8U)

  for (let i = 0; i < mat.width(); i++) {
    for (let j = 0; j < mat.height(); j++) {
      // calculate histogram
      let value = mat.pixelValueAt(i, j)
      histogramData[value]++
      if (histogramData[value] > histogramMax) {
        histogramMax = histogramData[value]
      }
    }
  }

  // draw histogram
  for (let x = 0; x < histogram.width(); x++) {
    for (let y = 0; y < histogram.height(); y++) {
      // console.log(histogramData[x]/histogramMax*256)
      if (histogram.height() - y >= histogramData[x] / histogramMax * histogram.height()) {
        histogram.pixel(y, x, [255, 255, 255])
      } else {
        histogram.pixel(y, x, [0, 0, 0])
      }
    }
  }
  // calculate the cdf of each gray level.
  for (let i = 1; i < 256; i++) {
    histogramData[i] += histogramData[i - 1]
  }

  return histogram
}
