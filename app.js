var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(__dirname + '/app'));
app.listen(process.env.PORT || 3000);

// allows angular to handle routing instead of server
app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname + '/app/index.html'));
})

console.log('server is running');