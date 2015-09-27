var cv = require("opencv")

exports.showMatrixOnWindow = function (mat) {
	var window = new cv.NamedWindow('HOMEWORK QAQ', 0);
	window.show(mat);
	window.blockingWaitKey(0, 50);
	setTimeout(function(){
	  // keep the windows 30sec open
	},30000);
}
