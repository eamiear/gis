/**
 * Created by K on 2017/6/11.
 */

const path = require('path');
const fs = require('fs');
const createDirPath = (space,dirName)=>{
  return `|${space}+---${dirName}\n`;
} ;
const createFilePath = (space,fileName)=>{
  return `|${space}${fileName}\n`;
};

const explorer = (path,out,space,tree)=>{
  tree += tree;
  const files = fs.readdirSync(path);
  files.forEach((file) => {
    const dirName = path + "/" + file;
    const stat = fs.statSync(dirName);

    if (stat.isDirectory()) {
      explorer(dirName, out, space+"    ",createDirPath('',dirName));
    } else {
      tree += createFilePath('',file);
      fs.writeFile(out,tree,(err) => {
        err ? console.log('wrote fail: ' + err) : console.log(file + ' wrote success!')
      })
    }
  });
};
explorer('src/extras','tree.txt','','');
