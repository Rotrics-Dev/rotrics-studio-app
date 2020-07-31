# rotrics-studio-app

## clone代码并安装依赖
请保证不低于下面的版本  
node: 14.1.0  
npm: 6.14.4  
electron: 9.0.0  
serialport: 9.0.0  

```bash
# clone repository，必须三个repository都放在同一个文件夹下（影响copy_files.js脚本执行）
git clone https://github.com/Rotrics-Dev/rotrics-studio-app.git
git clone https://github.com/Rotrics-Dev/rotrics-scratch-vm.git
git clone https://github.com/Rotrics-Dev/rotrics-scratch-blocks.git

# npm太慢，推荐cnpm
cd rotrics-scratch-vm
cnpm install
npm link

cd rotrics-scratch-blocks
cnpm install
npm link

cd rotrics-studio-app/server
cnpm install

cd rotrics-studio-app/web
cnpm install

cd rotrics-studio-app/electron
cnpm install
npm run rebuild  #重新编译native module(目前只用到serialport)，保证和electron node版本对应
```

## 开发环境下运行
```bash
cd rotrics-studio-app/server
npm start

cd rotrics-studio-app/web
npm start
``` 
若一切正常，浏览器会自动打开页面：http://localhost:8080/  

## Electron 环境下运行
```bash
cd rotrics-studio-app/server
npm run build

cd rotrics-studio-app/web
npm run build

cd rotrics-studio-app/electron
npm start
# 若提示serialport版本与electron node版本不对应，请执行：npm run rebuild
```

## 项目结构简述
包括三个子项目，都是node项目  
### web
前端部分, build后得到"index.html+js+资源"，electron运行时执行loadFile(index.html)
### server
local server, 给web端提供http api和socket connection，再访问native层  
### electron
web中运行时候，local server使用指定address：http://localhost:9000  
electron运行时，动态获取端口，并将local server address挂在window下  
方便web端获取，从未建立socket connect和使用http api  
electron执行main.js时候，先启动local server，成功后再加载web端build得到的index.html

## 注意事项
server依赖的serialport必须和开发电脑上所安装的node版本对应  
electron依赖的serialport必须和electron node版本对应，因此需要rebuild  
electron和server的package.json中的dependencies需要保持一致   
electron下，安装node_modules必须使用npm而不是cnpm 

## Electron 打包
进入目录/web：npm run build  
进入目录/server：npm run build  
进入目录/electron  
先rebuild serialport：npm run rebuild 
mac打包：npm run build:mac-x64  
win打包：npm run build:win-x64 

## TODO:  
Windows下构建rotrics-scratch-blocks    
