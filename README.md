# rotrics-studio-app

## 开发构建
请尽量使用下面的版本：  
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
npm start

cd rotrics-studio-app/web
cnpm install
npm start

cd rotrics-studio-app/electron
cnpm install
npm run rebuild    # 重新编译native module(serialport)，保证和electron node版本对应
```
浏览器打开：http://localhost:8080/  
正常情况下，可以看到页面

## 打包
```bash
cd rotrics-studio-app/web
npm run build
# copy rotrics-studio-app/web/build-web到rotrics-studio-app/electron下

cd rotrics-studio-app/server
# copy rotrics-studio-app/server/src到rotrics-studio-app/electron/build-server下

cd rotrics-studio-app/electron
npm start # 测试打包
# 若提示serialport版本与electron node版本不对应，请执行：npm run rebuild
```
electron的目录结构应该如下：  
/--build-server--src--...  
/--build-web--...  
/--static--font--...  


## TODO:  
Windows下构建rotrics-scratch-blocks  
