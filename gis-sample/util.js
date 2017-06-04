/**
 * 替换demo中的地图服务IP
 * Created by skz on 2017/3/21 0021.
 */

var path = require('path');
var fs = require('fs');
var dealSomingAsync = function(path, fileReg, replaceReg, fn) {
    var files = fs.readdirSync(path);
    files.forEach(function(item) {
        if (fileReg.test(item)) {
            var filePath = path + '/' + item;
            var str = fs.readFileSync(filePath, 'utf-8');
            str = str.replace(replaceReg, fn);
            fs.writeFile(filePath, str, function(err) {
                err ? console.log('write fail: ' + err) : console.log(item + " write success!")
            });
        }
    })
};

dealSomingAsync(path.resolve(__dirname, 'demo'), /\.htm/, /(192.168.16.177:8088)/g, function() {
    return '172.16.16.109:8088'
});

dealSomingAsync(path.resolve(__dirname, 'demo'), /\.js/, /(192.168.16.177:8088)/g, function() {
    return '172.16.16.109:8088'
});

dealSomingAsync(path.resolve(__dirname, 'demo'), /\.htm/, /(jsLib)/g, function() {
    return 'src/assets'
});
