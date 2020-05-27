# rotrics-studio-app

## clone代码并安装依赖
请尽量使用下面的版本，或者更高版本：  
node: 14.1.0  
npm: 6.14.4  
electron: 9.0.0  
serialport: 9.0.0  

```bash
# clone repository，建议三个repository都放在同一个文件夹下
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
npm run rebuild    # 重新编译native module(目前只用到serialport)，保证和electron node版本对应
```

## web环境下运行
```bash
cd rotrics-studio-app/server
npm start

cd rotrics-studio-app/web
npm start
```
指定使用8080端口  
若一切正常  
浏览器打开：http://localhost:8080/  
可以看到页面

## electron环境下运行
```bash
cd rotrics-studio-app/web
npm run build
# copy rotrics-studio-app/web/build-web到rotrics-studio-app/electron下

# copy rotrics-studio-app/server/src到rotrics-studio-app/electron/build-server下

cd rotrics-studio-app/electron
npm start
# 正常情况下，会跳出一个electron窗口，并显示之前浏览器所看到的洁面
# 若提示serialport版本与electron node版本不对应，请执行：npm run rebuild
```
electron的目录结构应该如下：  
electron/build-server/src/ (rotrics-studio-app/server/src中所有内容)  
electron/build-web/ (rotrics-studio-app/web/build-web的所有内容)   
electron/static/fonts/ (一些字体文件)

## electron打包

## 项目结构简述
此项目包括三个子项目，都是node项目  
### web
前端部分, build后得到"index.html+js+资源"，electron运行时执行loadFile(index.html)
### server
local server, 给web端提供http api和socket connection，再访问native层  
### electron
web中运行时候，local server使用指定ip：http://localhost:9000  
electron运行时，动态获取端口，并将local server ip挂在window下  
方便web端获取，从未建立socket connect和使用http api  
electron使用  
web端：build后的"index.html+js+资源"  
local server端：使用源码  
将上述两部分放在指定的路径即可


## 注意事项
server依赖的serialport必须和开发电脑上所安装的node版本对应  
electron依赖的serialport必须和electron node版本对应，因此需要rebuild  
electron和server的package.json中的dependencies需要保持一致  

## TODO:  
Windows下构建rotrics-scratch-blocks  
