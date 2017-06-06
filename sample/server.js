
const http = require('http');
const fs = require('fs');
const server = new http.Server();
const port = 4000;
server.listen(port);

server.on('request', function(request, response) {
  var url = require('url').parse(request.url);
  switch(url.pathname) {
    case '' || '/' :
      fs.readFile('./index.html', function(err, content){
        if(err) {
          response.writeHead(404, { 'Content-Type':'text/plain; charset="UTF-8"' });
          response.write(err.message);
          response.end();
        } else {
          response.writeHead(200, { 'Content-Type' : 'text/html; charset=UTF-8' });
          response.write(content);
          response.end();
        }
      });
      break;
    case '/test/delay':
      var delay = parseInt(url.query) || 2000;
      response.writeHead(200, {'Content-type':'text/plain; charset=UTF-8'});
      response.write('Sleeping for ' + delay + ' milliseconds...');
      setTimeout(function(){
        response.write('done.');
        response.end();
      }, delay);
      break;
    case '/test/mirror':
      response.writeHead(200, {'Content-type':'text/plain; charset=UTF-8'});
      response.write(request.mothod + ' ' + request.url + ' HTTP/' + request.httpVersion + '\r\n');
      for (var h in request.headers) {
        response.write(h + ':' + request.headers[h] + '\r\n');
      }
      response.write('\r\n');
      request.on('data', function(chunk) { response.write(chunk); });
      request.on('end', function(chunk){ response.end(); });
      break;
    case '/json' : // 模拟JSON数据返回
      // 响应状态和头
      response.writeHead(200, {'Content-type':'application/json; charset=UTF-8'});
      response.write(JSON.stringify({test:'success'}));
      response.end();
      break;
    default:// 处理来自本地目录的文件
      var filename = url.pathname.substring(1);    // 去掉前导'/'
      var type = getType(filename.substring(filename.lastIndexOf('.')+1));
      // 异步读取文件,并将内容作为单独的数据模块传给回调函数
      // 对于确实很大的文件,使用流API fs.createReadStream()更好
      fs.readFile(filename, function(err, content){
        if(err) {
          response.writeHead(404, { 'Content-Type':'text/plain; charset="UTF-8"' });
          response.write(err.message);
          response.end();
        } else {
          response.writeHead(200, { 'Content-Type' : type });
          response.write(content);
          response.end();
        }
      });
      break;
  }
});
console.log("server %s start ...", "http://127.0.0.1:"+ port);
function getType(endTag){
  var type=null;
  switch(endTag){
    case 'html' :
    case 'htm' :
      type = 'text/html; charset=UTF-8';
      break;
    case 'js' :
      type = 'application/javascript; charset="UTF-8"';
      break;
    case 'css' :
      type = 'text/css; charset="UTF-8"';
      break;
    case 'txt' :
      type = 'text/plain; charset="UTF-8"';
      break;
    case 'manifest' :
      type = 'text/cache-manifest; charset="UTF-8"';
      break;
    default :
      type = 'application/octet-stream';
      break;
  }
  return type;
}
