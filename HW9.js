'use strict'

const cv = require('opencv')
const utils = require('./utils')
const BLACK = [0, 0, 0]
const WHITE = [255, 255, 255]

function getNeighbors (mat, origin, size) {
  let half = size.x / 2
  let neighbors = new Array(size.y)
  // initialize the array
  for (let i = 0; i < neighbors.length; i++) {
    neighbors[i] = Array.apply(null, Array(size.x)).map(Number.prototype.valueOf, 0)
  }
  // console.log(neighbors)
  for (let row = -half; row < half; row++) {
    for (let col = -half; col < half; col++) {
      // console.log(half + col,[half + row])
      neighbors[half + col][half + row] = mat.pixelValueAt(origin.y + row, origin.x + col)
    }
  }
  return neighbors
}

function L2NormMagnitude (neighbors, masks, threshold) {
  let count = masks.length
  let sizeX = masks[0].length
  let sizeY = masks[0][0].length
  let magnitude = []
  for (let i = 0; i < count; i++) {
    let r = 0
    // console.log(sizeX, sizeY)
    for (let y = 0; y < sizeY; y++) {
      for (let x = 0; x < sizeX; x++) {
        // console.log(neighbors[y][x], masks[i][y][x])
        r += neighbors[y][x] * masks[i][y][x]
      }
    }
    magnitude.push(r * r)
  }
  let sum = magnitude.reduce(function (a, b) {
    return a + b
  })
  return Math.sqrt(sum) > threshold
}

function MaxMagnitude (neighbors, masks, threshold) {
  let count = masks.length
  let sizeX = masks[0].length
  let sizeY = masks[0][0].length
  let magnitude = []
  for (let i = 0; i < count; i++) {
    let r = 0
    for (let y = 0; y < sizeY; y++) {
      for (let x = 0; x < sizeX; x++) {
        r += neighbors[y][x] * masks[i][y][x]
      }
    }
    magnitude.push(r)
  }

  return Math.max.apply(null, magnitude) > threshold
}

function robertDetector (origin, mat, threshold) {
  let masks = [[[-1, 0], [0, 1]], [[0, -1], [1, 0]]]
  let neighbors = []
  neighbors.push([mat.pixelValueAt(origin.y, origin.x), mat.pixelValueAt(origin.y, origin.x + 1)])
  neighbors.push([mat.pixelValueAt(origin.y + 1, origin.x), mat.pixelValueAt(origin.y + 1, origin.x + 1)])

  if (L2NormMagnitude(neighbors, masks, threshold)) {
    return BLACK
  } else {
    return WHITE
  }
}

function prewittDetector (origin, mat, threshold) {
  let masks = [[[-1, -1, -1], [0, 0, 0], [1, 1, 1]], [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]]]
  let neighbors = getNeighbors(mat, origin, {x: 3, y: 3})
  if (L2NormMagnitude(neighbors, masks, threshold)) {
    return BLACK
  } else {
    return WHITE
  }
}

function sobelDetector (origin, mat, threshold) {
  let masks = [[[-1, -2, -1], [0, 0, 0], [1, 2, 1]], [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]]
  let neighbors = getNeighbors(mat, origin, {x: 3, y: 3})
  if (L2NormMagnitude(neighbors, masks, threshold)) {
    return BLACK
  } else {
    return WHITE
  }
}

function freichenDetector (origin, mat, threshold) {
  let sqrt2 = Math.sqrt(2)
  let masks = [[[-1, -sqrt2, -1], [0, 0, 0], [1, sqrt2, 1]], [[-1, 0, 1], [-sqrt2, 0, sqrt2], [-1, 0, 1]]]
  let neighbors = getNeighbors(mat, origin, {x: 3, y: 3})
  if (L2NormMagnitude(neighbors, masks, threshold)) {
    return BLACK
  } else {
    return WHITE
  }
}

function kirschDetector (origin, mat, threshold) {
  let masks = [[[-3, -3, 5], [-3, 0, 5], [-3, -3, 5]],
               [[-3, 5, 5], [-3, 0, 5], [-3, -3, -3]],
               [[5, 5, 5], [-3, 0, -3], [-3, -3, -3]],
               [[5, 5, -3], [5, 0, -3], [-3, -3, -3]],
               [[5, -3, -3], [5, 0, -3], [5, -3, -3]],
               [[-3, -3, -3], [5, 0, -3], [5, 5, -3]],
               [[-3, -3, -3], [-3, 0, -3], [5, 5, 5]],
               [[-3, -3, -3], [-3, 0, 5], [-3, 5, 5]]]

  let neighbors = getNeighbors(mat, origin, {x: 3, y: 3})
  if (MaxMagnitude(neighbors, masks, threshold)) {
    return BLACK
  } else {
    return WHITE
  }
}

function robinsonDetector (origin, mat, threshold) {
  let masks = [[[-1, -2, -1], [0, 0, 0], [1, 2, 1]],
               [[0, -1, -2], [1, 0, -1], [2, 1, 0]],
               [[1, 0, -1], [2, 0, -2], [1, 0, -1]],
               [[2, 1, 0], [1, 0, -1], [0, -1, -2]],
               [[1, 2, 1], [0, 0, 0], [-1, -2, -1]],
               [[0, 1, 2], [-1, 0, 1], [-2, -1, 0]],
               [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
               [[-2, -1, 0], [-1, 0, 1], [0, 1, 2]]]

  let neighbors = getNeighbors(mat, origin, {x: 3, y: 3})
  if (MaxMagnitude(neighbors, masks, threshold)) {
    return BLACK
  } else {
    return WHITE
  }
}

function nevatiababuDetector (origin, mat, threshold) {
  let masks = [[[100, 100, 0, -100, -100], [100, 100, 0, -100, -100], [100, 100, 0, -100, -100], [100, 100, 0, -100, -100], [100, 100, 0, -100, -100]],
               [[100, 100, 100, 32, -100], [100, 100, 92, -78, -100], [100, 100, 0, -100, -100], [100, 78, -92, -100, -100], [100, -32, -100, -100, -100]],
               [[100, 100, 100, 100, 100], [100, 100, 100, 78, -32], [100, 92, 0, -92, -100], [32, -78, -100, -100, -100], [-100, -100, -100, -100, -100]],
               [[-100, -100, -100, -100, -100], [-100, -100, -100, -100, -100], [0, 0, 0, 0, 0], [100, 100, 100, 100, 100], [100, 100, 100, 100, 100]],
               [[-100, -100, -100, -100, -100], [32, -78, -100, -100, -100], [100, 92, 0, -92, -100], [100, 100, 100, 78, -32], [100, 100, 100, 100, 100]],
               [[100, -32, -100, -100, -100], [100, 78, -92, -100, -100], [100, 100, 0, -100, -100], [100, 100, 92, -78, -100], [100, 100, 100, 32, -100]]]

  let neighbors = getNeighbors(mat, origin, {x: 5, y: 5})
  if (MaxMagnitude(neighbors, masks, threshold)) {
    return BLACK
  } else {
    return WHITE
  }
}

function main () {
  // read lena image from the file system using opencv
  cv.readImage(process.argv[2], function (err, inputMat) {
    if (err || inputMat.height() === 0 || inputMat.width === 0) {
      console.log('input image error!')
      return
    }
    let outputDirectory = './output/HW9/'
    let robertMat = inputMat.copy()
    let prewittMat = inputMat.copy()
    let sobelMat = inputMat.copy()
    let freichenMat = inputMat.copy()
    let kirschMat = inputMat.copy()
    let robinsonMat = inputMat.copy()
    let nevatiababuMat = inputMat.copy()

    for (let i = 0; i < inputMat.height(); i++) { // row
      for (let j = 0; j < inputMat.width(); j++) { // col
        robertMat.pixel(i, j, robertDetector({x: j, y: i}, inputMat, 12))
        prewittMat.pixel(i, j, prewittDetector({x: j, y: i}, inputMat, 24))
        sobelMat.pixel(i, j, sobelDetector({x: j, y: i}, inputMat, 38))
        freichenMat.pixel(i, j, freichenDetector({x: j, y: i}, inputMat, 30))
        kirschMat.pixel(i, j, kirschDetector({x: j, y: i}, inputMat, 135))
        robinsonMat.pixel(i, j, robinsonDetector({x: j, y: i}, inputMat, 43))
        nevatiababuMat.pixel(i, j, nevatiababuDetector({x: j, y: i}, inputMat, 12500))
      }
    }
    robertMat.save(outputDirectory + 'HW9_robert_12.bmp')
    prewittMat.save(outputDirectory + 'HW9_prewitt_24.bmp')
    sobelMat.save(outputDirectory + 'HW9_sobel_38.bmp')
    freichenMat.save(outputDirectory + 'HW9_freichen_30.bmp')
    kirschMat.save(outputDirectory + 'HW9_kirsch_135.bmp')
    robinsonMat.save(outputDirectory + 'HW9_robinson_43.bmp')
    nevatiababuMat.save(outputDirectory + 'HW9_nevatiababu_12500.bmp')
    console.log('finished')
  })
}

main()
