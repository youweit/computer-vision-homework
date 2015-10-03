var cv = require("opencv")

cv.Matrix.prototype.pixelValueAt = function(i,j) {
  return this.pixel(i,j)[0]
}

exports.showMatrixOnWindow = function (mat) {
  var window = new cv.NamedWindow('HOMEWORK QAQ', 0);
  window.show(mat);
  window.blockingWaitKey(0, 50);
  setTimeout(function(){
    // keep the windows 30sec open
  },30000);
}
