var cv = require("opencv"),
    utils = require("./utils")

function BoundingBox(label) {
  this.label = label
  this.top = 512
  this.left = 512
  this.down = 0
  this.right = 0
  this.area = 0
  this.totalX = 0
  this.totalY = 0
}

function main() {

  //read lena image from the file system using opencv
  cv.readImage('image/lena.bmp', function(err, inputMat){

    var binary = inputMat.copy(),
        connectComponet = inputMat.copy(),
        height = inputMat.height(),
        width = inputMat.width(),
        binaryThreshold = 128,
        histogramMax = 0,
        histogramData = new Uint32Array(256)
    console.log("input image =", width, " x ",height)

    /**
     * Use matrix.pixelValueAt(i, j) to get the pixel
     *     matrix.pixel(i, j, [b,g,r]) to set the pixel
     **/
    for (var i = 0; i < width; i++) {
      for (var j = 0; j < height; j++) {
        //calculate histogram
        var value = inputMat.pixelValueAt(i,j)
        histogramData[value]++
        if (histogramData[value] > histogramMax) {
          histogramMax = histogramData[value]
        }
        //apply binary for threshold
        pixel = value < binaryThreshold ? [0, 0, 0]: [255, 255, 255]
        binary.pixel(i, j, pixel)
      }
    }
    binary.save('./output/HW2/HW2_binary.bmp')

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
    histogram.save('./output/HW2/HW2_histogram.bmp')

    //connect componet here
    var globalLabel = 1,
        connectedPointValue = 255,
        label = new Array(512)

    //initial the label array with capacity 512x512
    for (var i = 0; i < 512; i++) {
        label[i] = new Array(512)
    }

    for (var i = 0; i < height; i++) {
      for (var j = 0; j < width; j++) {
        label[i][j] = 0
        if (binary.pixelValueAt(i,j) == connectedPointValue) {
          if (i != 0 && j!= 0) {
            if (binary.pixelValueAt(i, j-1) == connectedPointValue && binary.pixelValueAt(i-1, j) == connectedPointValue) {
              label[i][j] = Math.min(label[i][j-1], label[i-1][j])
            } else if (binary.pixelValueAt(i, j-1) == connectedPointValue) {
              label[i][j] = label[i][j-1]
            } else if (binary.pixelValueAt(i-1, j) == connectedPointValue) {
              label[i][j] = label[i-1][j]
            } else {
              label[i][j] = globalLabel++
            }
          } else if (i == 0 && j != 0) {
            label[i][j] = binary.pixelValueAt(i, j-1) == connectedPointValue? label[i][j-1]: globalLabel++
          } else if (i != 0 && j == 0) {
            label[i][j] = binary.pixelValueAt(i-1, j) == connectedPointValue? label[i-1][j]: globalLabel++
          } else {
            //first pixel in every row
            label[i][j] = globalLabel++
          }
        }
      }
    }

    var top = 0,
        k = 0,
        modified = false,
        maxY = height-1,
        maxX = width-1

    do {
      console.log("searching... ...")
      //top down
      for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
          if (label[i,j] > 0) {
            k = 0
            if (i != 0 && j != 0) {
              k = Math.min(label[i-1][j], label[i][j-1])
              if (label[i][j] < k || k == 0) {
                k = label[i, j]
              } else if (i != 0 && j == 0) {
                k = Math.min(label[i][j], label[i-1][j])
              } else if (i == 0 && j != 0) {
                k = Math.min(label[i][j], label[i][j-1])
              }
              if (label[i][j] != k) {
                modified = true
              }
              label[i][j] = k
            }
          }
        }
      }
      //bottom up
      for (var i = maxY; i >= 0; i--) {
        for (var j = maxX; j >= 0; j--) {
          if (label[i,j] > 0) {
            k = 0
            if (i != maxY && j != maxX) {
              k = Math.min(label[i+1][j], label[i][j+1])
              if (label[i][j] < k || k == 0) {
                k = label[i, j]
              } else if (i != maxY && j == maxX) {
                k = Math.min(label[i][j], label[i+1][j])
              } else if (i == maxY && j != maxX) {
                k = Math.min(label[i][j], label[i][j+1])
              }
              if (label[i][j] != k) {
                modified = true
              }
              label[i][j] = k
            }
          }
        }
      }
    } while (modified)

    //Draw the bounding boxes
    var boundingBoxes = new Array(globalLabel)
        max = 0
    //initialize the array
    for (var i = 0; i < boundingBoxes.length; i++) {
      boundingBoxes[i] = new BoundingBox(i)
    }

    //find the bounding boxes
    for (var i = 0; i < height; i++) {
      for (var j = 0; j < width; j++) {
        var currentLabel = label[i][j]
        if (currentLabel > 0) {
          if (i < boundingBoxes[currentLabel].left) {
            boundingBoxes[currentLabel].left = i
          }
          if (i > boundingBoxes[currentLabel].right) {
            boundingBoxes[currentLabel].right = i
          }
          if (j < boundingBoxes[currentLabel].top) {
            boundingBoxes[currentLabel].top = j
          }
          if (j > boundingBoxes[currentLabel].down) {
            boundingBoxes[currentLabel].down = j
          }
          boundingBoxes[currentLabel].area++
          boundingBoxes[currentLabel].totalX += j
          boundingBoxes[currentLabel].totalY += i
        }
      }
    }

    console.log("max = ",max, "boundingBoxes.length = ", boundingBoxes.length)
    var boxColor = [0, 255, 0]
    var cendroidColor = [0, 0, 255]
    for (var k = 0; k < boundingBoxes.length; k++) {
      //we only want the area greater than 500
      if (boundingBoxes[k].area > 500) {
        console.log("big boundingBoxes = ",boundingBoxes[k])
        if (boundingBoxes[k].label > 0) {
          for (var j = boundingBoxes[k].left; j <= boundingBoxes[k].right; j++) {
            binary.pixel(j, boundingBoxes[k].top, boxColor)
            binary.pixel(j, boundingBoxes[k].down, boxColor)
          }
          for (var j = boundingBoxes[k].top+1; j <= boundingBoxes[k].down-1; j++) {
            binary.pixel(boundingBoxes[k].left, j, boxColor)
            binary.pixel(boundingBoxes[k].right, j, boxColor)
          }
          //cendroid
          var x = boundingBoxes[k].totalX/boundingBoxes[k].area,
              y = boundingBoxes[k].totalY/boundingBoxes[k].area
          binary.pixel(y, x, cendroidColor)
          for (var size = 1; size < 4; size++) {
            binary.pixel(y-size, x, cendroidColor)
            binary.pixel(y+size, x, cendroidColor)
            binary.pixel(y, x-size, cendroidColor)
            binary.pixel(y, x+size, cendroidColor)
          } 
        }
      }
    }

    binary.save('./output/HW2/HW2_connected_component.bmp')
    console.log('finished!')
    utils.showMatrixOnWindow(binary)
  })
}
main()
