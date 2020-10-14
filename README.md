# 从零开始构建Rotrics Studio App

## 1.安装和配置
安装java，python2.7，node（>=14.1.0）     
配置环境变量：python，java      
配置cnpm：https://developer.aliyun.com/mirror/NPM?from=tnpm    
安装git bash（mac不需要安装；windows需要使用linux terminal；git bash比较好用）  

编译serialport和rotrics-scratch-blocks都需要用到python2.7    
安装最新的visual studio（要选择professional版本）（编译serialport时候需要）  
安装时候要注意，一定要选择“Desktop development with C++”，在workload选项中  
否则会报错：“Visual Studio C++ core feature” missing  
  
## 2.clone代码并安装依赖
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
#electron用于打包，特殊，需要使用npm安装；cnpm和npm并不相同；
#使用cnpm安装后，打包的软件打开速度特别慢；耐心等，可能需要半小时
npm install
#重新编译native module(目前只用到serialport)，保证和electron node版本对应；
#耐心等，可能需要半小时
npm run rebuild  
```

## 3.其他
编译rotrics-scratch-blocks：  
for mac: npm run prepublish-mac  
for win: npm run prepublish-win  

复制文件  
cd rotrics-studio-app/web  
新建文件夹：build-web，并将web/index.html copy到build-web下  

## 4.开发环境下运行
```bash
cd rotrics-studio-app/server
npm start

cd rotrics-studio-app/web
npm start
##若一切正常，可以看到页面正常显示：http://localhost:8080/  
``` 

## 5.Electron环境下运行
```bash
cd rotrics-studio-app/server
npm run build

cd rotrics-studio-app/web
npm run build

cd rotrics-studio-app/electron
npm start
# 若提示serialport版本与electron node版本不对应，请执行：npm run rebuild
```

## 6.Electron打包
```bash
cd rotrics-studio-app/electron
#for mac: 
#必须在mac电脑上
npm run build:mac-x64

#for win:
#必须在windows电脑上
npm run build:win-x64
```

# 项目结构简述
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
node: >=14.1.0
electron: >=9.0.0  
serialport: >=9.0.0   

若提示serialport版本与electron node版本不对应，请执行：npm run rebuild  
electron依赖的serialport必须和electron node版本对应，因此需要rebuild  
electron和server的package.json中的dependencies需要保持一致   
electron下，安装node_modules必须使用npm而不是cnpm  

要保证两个文件内容一致：server/src/constants.js和web/src/constants.js  
