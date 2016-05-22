
var myWin = null;

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('sandbox.html', {
    'bounds': {
      'width': 400,
      'height': 400
    }
  }, function(win) {
       myWin = win;
       myWin.contentWindow.postMessage('Just wanted to say hey.', '*');
     });
});