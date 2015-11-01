var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app);

app.use(express.static("public"));
 
server.listen(4004);