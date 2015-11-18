'use strict'

const cv = require('opencv')
const utils = require('./utils')
const fs = require('fs')

function scaleDown (inputMat) {
  let result = new cv.Matrix(64, 64, cv.Constants.CV_8U)
  for (let i = 0; i < result.height(); i++) { // row
    for (let j = 0; j < result.width(); j++) { // column
      let value = inputMat.pixelValueAt(i * 8, j * 8)
      result.pixel(i, j, [value, value, value])
    }
  }

  return result
}

function h (b, c, d, e) {
  if (b === c && (d != b || e != b)) {
    return 'q'
  } else if (b === c && (d === b || e === b)) {
    return 'r'
  } else if (b != c) {
    return 's'
  }
}

function f (a1, a2, a3, a4) {
  let neighbors = [a1, a2, a3, a4]
  var rlength = neighbors.filter(function (value) { return value === 'r' }).length
  if (neighbors.length === rlength) {
    return 5
  } else {
    return neighbors.filter(function (value) { return value === 'q' }).length
  }
}

function yokoiConnect (neighbors) {
  return f(
    h(neighbors[0], neighbors[1], neighbors[6], neighbors[2]),
    h(neighbors[0], neighbors[2], neighbors[7], neighbors[3]),
    h(neighbors[0], neighbors[3], neighbors[8], neighbors[4]),
    h(neighbors[0], neighbors[4], neighbors[5], neighbors[1])
  )
}

/*
[7][2][6]
[3][0][1]
[8][4][5]
*/
function getNeighbors (mat, col, row) {
  return [
    mat.pixelValueAt(col, row),
    mat.pixelValueAt(col, row + 1),
    mat.pixelValueAt(col - 1, row),
    mat.pixelValueAt(col, row - 1),
    mat.pixelValueAt(col + 1, row),
    mat.pixelValueAt(col + 1, row + 1),
    mat.pixelValueAt(col - 1, row + 1),
    mat.pixelValueAt(col - 1, row - 1),
    mat.pixelValueAt(col + 1, row - 1),
  ]
}

function main () {
  // read lena image from the file system using opencv
  cv.readImage(process.argv[2], function (err, inputMat) {
    if (err || inputMat.height() === 0 || inputMat.width === 0) {
      console.log('input image error!')
      return
    }
    inputMat = scaleDown(inputMat)
    inputMat = utils.binarized(inputMat)
    inputMat.save('./output/HW6/HW6_lena64.bmp')

    let stream = fs.createWriteStream('./output/HW6/HW6_Yokoi.txt')
    for (let i = 0; i < inputMat.height(); i++) { // row
      let out = ''
      for (let j = 0; j < inputMat.width(); j++) { // column
        let value = yokoiConnect(getNeighbors(inputMat, i, j))
        if (inputMat.pixelValueAt(i, j) === 255) {
          out += value
        } else {
          out += ' '
        }
      }
      stream.write(out + '\n')
      console.log(out)
    }

  })
}

main()
