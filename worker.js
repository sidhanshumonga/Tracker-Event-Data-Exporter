
self.addEventListener('message',function(e){
  if(e.data == 'start'){
    post.message(console.log('worker started'));
  }
  else{
  var data = JSON.stringify(e.data);
  var req = new XMLHttpRequest();

  req.open('GET', e.data, false);
  req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
  req.onreadystatechange = function () {
  if (req.readyState == 4 && req.status == 200) {
  //self.postMessage({ 'Error': 'No', 'Message': 'Save Successful' });
  }
  }
  req.send();
  var string = req.response + "&&&" + e.data;
  self.postMessage(string);
}

},false);
