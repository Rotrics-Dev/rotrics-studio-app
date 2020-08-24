you can call CuraEngine like the followings

mac
./CuraEngine slice -v -p -j "xx.def.json" -o "mac.gcode" -l "test.stl"

win
CuraEngine.exe slice -v -p -j "xx.def.json" -o "win.gcode" -l "test.stl"


使用命令行调用CuraEngine时候，
配置文件支持继承
子配置会覆盖父配置的参数值
继承关键字：inherits，id

继承关系：

   fdmprinter.def.json   => 3d打印的全部配置
          ｜
     machine.def.json    => 机器相关的配置，如加速度等
          ｜
activated_material.def.json   => 打印时，实际使用的material配置；调用CuraEngine之前，需要根据material name，复制指定的配置文件；注意"inherits": "machine",
          ｜
activated_setting.def.json    => 打印时，实际使用的setting配置；调用CuraEngine之前，需要根据setting name，复制指定的配置文件；注意"inherits": "activated_material",

调用CuraEngine：
因为路径问题处理的不是很好，因此需要区分，当前运行环境是否是Electron
步骤：
-1 参数stlUrl, materialName, settingName；
将materialName对应的配置文件内容写到：activated_material.def.json
将settingName对应的配置文件内容写到：activated_setting.def.json

-2 解析得到stl，activated_material.def.json，activated_setting.def.json的相对路径

-3 指定输出gcode路径

-4 调用CuraEngine



