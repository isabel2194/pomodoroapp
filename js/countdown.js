self.onmessage = function(msg) {
  var n = msg.data;
  counter(n);
};

var countdown;
function counter(n) {
  console.log("countodown:" + n);
  if (n > 0) {
    countdown = setTimeout(function() {
      n = n - 1;
      counter(n);
    }, 1000);
    postMessage(n);
  } else {
    clearTimeout(countdown);
    postMessage(n);
  }
}
