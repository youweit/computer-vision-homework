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

function calculateKernel (neighbors, mask, size, threshold, alpha) {
  let result = 0
  for (let i = 0; i < size.y; i++) { // row
    for (let j = 0; j < size.x; j++) { // column
      result += (neighbors[j][i] * mask[j][i])
    }
  }
  result *= alpha
  if (result >= threshold) {
    return 1
  } else if (result < -threshold) {
    return -1
  } else {
    return 0
  }
}

function checkNeighbors (position, labels, size) {
  let half = Math.floor(size.x / 2)
  if (labels[position.x][position.y] === 1) {
    for (let row = -half; row < half; row++) {
      for (let col = -half; col < half; col++) {
        if (position.x + col >= 0 && position.x + col < labels.length && position.y + row >= 0 && position.y < labels.length) {
          if (labels[position.x + col][position.y + row] === -1) {
            return BLACK
          }
        }
      }
    }
  }
  return WHITE
}

function main () {
  // read lena image from the file system using opencv
  cv.readImage(process.argv[2], function (err, inputMat) {
    if (err || inputMat.height() === 0 || inputMat.width === 0) {
      console.log('input image error!')
      return
    }
    let outputDirectory = './output/HW10/'
    let laplacian1Mat = inputMat.copy()
    let laplacian2Mat = inputMat.copy()
    let minimumMat = inputMat.copy()
    let laplaceGaussianMat = inputMat.copy()
    let diffGaussianMat = inputMat.copy()

    let mask1 = [[0, 1, 0], [1, -4, 1], [0, 1, 0]]
    let mask2 = [[1, 1, 1], [1, -8, 1], [1, 1, 1]]
    let minMask = [[2, -1, 2], [-1, -4, -1], [2, -1, 2]]
    let gaussianMask = [
      [0, 0, 0, -1, -1, -2, -1, -1, 0, 0, 0],
      [0, 0, -2, -4, -8, -9, -8, -4, -2, 0, 0],
      [0, -2, -7, -15, -22, -23, -22, -15, -7, -2, 0],
      [-1, -4, -15, -24, -14, -1, -14, -24, -15, -4, -1],
      [-1, -8, -22, -14, 52, 103, 52, -14, -22, -8, -1],
      [-2, -9, -23, -1, 103, 178, 103, -1, -23, -9, -2],
      [-1, -8, -22, -14, 52, 103, 52, -14, -22, -8, -1],
      [-1, -4, -15, -24, -14, -1, -14, -24, -15, -4, -1],
      [0, -2, -7, -15, -22, -23, -22, -15, -7, -2, 0],
      [0, 0, -2, -4, -8, -9, -8, -4, -2, 0, 0],
      [0, 0, 0, -1, -1, -2, -1, -1, 0, 0, 0]
    ]

    let diffGaussianMask = [
      [-1, -3, -4, -6, -7, -8, -7, -6, -4, -3, -1],
      [-3, -5, -8, -11, -13, -13, -13, -11, -8, -5, -3],
      [-4, -8, -12, -16, -17, -17, -17, -16, -12, -8, -4],
      [-6, -11, -16, -16, 0, 15, 0, -16, -16, -11, -6],
      [-7, -13, -17, 0, 85, 160, 85, 0, -17, -13, -7],
      [-8, -13, -17, 15, 160, 283, 160, 15, -17, -13, -8],
      [-7, -13, -17, 0, 85, 160, 85, 0, -17, -13, -7],
      [-6, -11, -16, -16, 0, 15, 0, -16, -16, -11, -6],
      [-4, -8, -12, -16, -17, -17, -17, -16, -12, -8, -4],
      [-3, -5, -8, -11, -13, -13, -13, -11, -8, -5, -3],
      [-1, -3, -4, -6, -7, -8, -7, -6, -4, -3, -1]
    ]

    let laplacian1MatTemp = new Array(inputMat.height())
    for (let i = 0; i < laplacian1MatTemp.length; i++) {
      laplacian1MatTemp[i] = Array.apply(null, Array(inputMat.width())).map(Number.prototype.valueOf, 0)
    }
    let laplacian2MatTemp = new Array(inputMat.height())
    for (let i = 0; i < laplacian2MatTemp.length; i++) {
      laplacian2MatTemp[i] = Array.apply(null, Array(inputMat.width())).map(Number.prototype.valueOf, 0)
    }
    let minimumMatTemp = new Array(inputMat.height())
    for (let i = 0; i < minimumMatTemp.length; i++) {
      minimumMatTemp[i] = Array.apply(null, Array(inputMat.width())).map(Number.prototype.valueOf, 0)
    }
    let laplaceGaussianMatTemp = new Array(inputMat.height())
    for (let i = 0; i < laplaceGaussianMatTemp.length; i++) {
      laplaceGaussianMatTemp[i] = Array.apply(null, Array(inputMat.width())).map(Number.prototype.valueOf, 0)
    }
    let diffGaussianMatTemp = new Array(inputMat.height())
    for (let i = 0; i < diffGaussianMatTemp.length; i++) {
      diffGaussianMatTemp[i] = Array.apply(null, Array(inputMat.width())).map(Number.prototype.valueOf, 0)
    }


    for (let i = 0; i < inputMat.height(); i++) { // row
      for (let j = 0; j < inputMat.width(); j++) { // col
        laplacian1MatTemp[j][i] = calculateKernel(getNeighbors(inputMat, {x: j, y: i}, {x: 3, y: 3}), mask1, {x: 3, y: 3}, 15, 1)
        laplacian2MatTemp[j][i] = calculateKernel(getNeighbors(inputMat, {x: j, y: i}, {x: 3, y: 3}), mask2, {x: 3, y: 3}, 15, 1 / 3.0)
        minimumMatTemp[j][i] = calculateKernel(getNeighbors(inputMat, {x: j, y: i}, {x: 3, y: 3}), minMask, {x: 3, y: 3}, 20, 1 / 3.0)
        laplaceGaussianMatTemp[j][i] = calculateKernel(getNeighbors(inputMat, {x: j, y: i}, {x: 11, y: 11}), gaussianMask, {x: 11, y: 11}, 3000, 1)
        diffGaussianMatTemp[j][i] = calculateKernel(getNeighbors(inputMat, {x: j, y: i}, {x: 11, y: 11}), diffGaussianMask, {x: 11, y: 11}, 1, 1)
      }
    }

    for (let i = 0; i < inputMat.height(); i++) { // row
      for (let j = 0; j < inputMat.width(); j++) { // col
        laplacian1Mat.pixel(i, j, checkNeighbors({x: j, y: i}, laplacian1MatTemp, {x: 3, y: 3}))
        laplacian2Mat.pixel(i, j, checkNeighbors({x: j, y: i}, laplacian2MatTemp, {x: 3, y: 3}))
        minimumMat.pixel(i, j, checkNeighbors({x: j, y: i}, minimumMatTemp, {x: 3, y: 3}))
        laplaceGaussianMat.pixel(i, j, checkNeighbors({x: j, y: i}, laplaceGaussianMatTemp, {x: 11, y: 11}))
        diffGaussianMat.pixel(i, j, checkNeighbors({x: j, y: i}, diffGaussianMatTemp, {x: 11, y: 11}))
      }
    }

    laplacian1Mat.save(outputDirectory + 'HW10_laplacian1.bmp')
    laplacian2Mat.save(outputDirectory + 'HW10_laplacian2.bmp')
    minimumMat.save(outputDirectory + 'HW10_minimum.bmp')
    laplaceGaussianMat.save(outputDirectory + 'HW10_laplace_gaussian.bmp')
    diffGaussianMat.save(outputDirectory + 'HW10_diff_gaussian.bmp')

    console.log('finished')
  })
}

main()
