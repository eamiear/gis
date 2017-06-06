/**
 * Created by K on 2017/6/6.
 */
const path = require('path');
const fs = require('fs');

const Converter = {
  files: null,
  getFiles: (path) => {
    this.files = fs.readdirSync(path);
  },
  createMoudle: () => {

  },
  createDefineHeader: () => {

  },
  createDeclare: () => {

  },
  generate: (path,out,fileReg) => {
    const files = fs.readdirSync(path);
    files.forEach(function (item) {
      if(fileReg.test(item)){
        const filepath = path + '/' + item;
        const outputPath = out + '/' + item;
        const data = fs.readFileSync(filepath,'utf-8');
        let str = '';
        str += this.createMoudle(data);
        str += this.createDefineHeader(data);
        str += this.createDeclare(data);
        fs.writeFile(outputPath,str,(err) => {
          err ? console.log('convert fail: ' + err) : console.log(item + ' convert success!')
        })
      }
    })
  }
};
