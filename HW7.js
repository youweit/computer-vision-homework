'use strict'

const cv = require('opencv')
const utils = require('./utils')
const BLACK = [0, 0, 0]

/*
[8][1][2]
[7][0][3]
[6][5][4]
*/
// x = col,y = row
function getNeighbors (mat, row, col) {
  let neighbors = [
    mat.pixelValueAt(row, col),
    mat.pixelValueAt(row - 1, col),
    mat.pixelValueAt(row - 1, col + 1),
    mat.pixelValueAt(row, col + 1),
    mat.pixelValueAt(row + 1, col + 1),
    mat.pixelValueAt(row + 1, col),
    mat.pixelValueAt(row + 1, col - 1),
    mat.pixelValueAt(row, col - 1),
    mat.pixelValueAt(row - 1, col - 1)
  ]

  neighbors = neighbors.map(function (pixel, index, array) {
    if (pixel === undefined || pixel === 0) {
      return 0
    } else {
      return 1
    }
  })
  return neighbors
}

function checkClockwise (neighbors) {
  let counter = 0
  let local = neighbors.slice() // copy the array
  local.shift()
  local.push(local[0])

  for (let i = 0; i < local.length; i++) {
    if (i + 1 < local.length) {
      if (local[i] < local[i + 1]) {
        counter += 1
      }
    }
  }
  return counter === 1
}

function stepA (neighbors) {
  let sum = neighbors.reduce(function (a, b) {
    return a + b
  })
  // console.log('A sum = ', sum)
  if (sum - neighbors[0] >= 2 && sum - neighbors[0] <= 6 && checkClockwise(neighbors)) {
    if (neighbors[1] * neighbors[3] * neighbors[5] === 0 && neighbors[3] * neighbors[5] * neighbors[7] === 0) {
      return true
    }
  }
  return false
}

function stepB (neighbors) {
  let sum = neighbors.reduce(function (a, b) {
    return a + b
  })
  // console.log('B sum = ', sum)
  if (sum - neighbors[0] >= 2 && sum - neighbors[0] <= 6 && checkClockwise(neighbors)) {
    if (neighbors[1] * neighbors[3] * neighbors[7] === 0 && neighbors[1] * neighbors[5] * neighbors[7] === 0) {
      return true
    }
  }
  return false
}

function deletePixels (mat, pixelsToDelete) {
  let result = mat.copy()
  for (let i = 0; i < pixelsToDelete.length; i++) {
    let pixel = pixelsToDelete[i]
    // console.log(pixel.row, pixel.col)
    result.pixel(pixel.row, pixel.col, BLACK) // change it to black
  }
  return result
}

function applyThinning (inputMat) {
  let pass = 0
  let modefied = true
  let result = inputMat.copy()

  while (modefied) {
    pass++
    modefied = false
    let pixelsToDelete = []

    for (let i = 0; i < result.height(); i++) { // row
      for (let j = 0; j < result.width(); j++) { // column
        if (result.pixelValueAt(i, j) === 255) {
          if (stepA(getNeighbors(result, i, j))) {
            pixelsToDelete.push({row: i, col: j})
            modefied = true
          }
        }
      }
    }

    result = deletePixels(result, pixelsToDelete)

    // result.save('./output/HW7/HW7_lena64-' + pass + '.bmp')
    pixelsToDelete = [] // clear

    for (let i = 0; i < result.height(); i++) { // row
      for (let j = 0; j < result.width(); j++) { // column
        if (result.pixelValueAt(i, j) === 255) {
          if (stepB(getNeighbors(result, i, j))) {
            pixelsToDelete.push({row: i, col: j})
            modefied = true
          }
        }
      }
    }

    result = deletePixels(result, pixelsToDelete)
    console.log(pass, 'pass')
  }
  return result
}

function main () {
  // read lena image from the file system using opencv
  cv.readImage(process.argv[2], function (err, inputMat) {
    if (err || inputMat.height() === 0 || inputMat.width === 0) {
      console.log('input image error!')
      return
    }

    inputMat = utils.binarized(inputMat)
    inputMat = applyThinning(inputMat)

    inputMat.save('./output/HW7/HW7_thinning.bmp')
    console.log('finished')
  })
}

main()
