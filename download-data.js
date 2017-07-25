var fs = require('fs');
fs.writeFile("test.txt", jsonData, function(err) {
    if(err) {
        return console.log(err);
    }
});
