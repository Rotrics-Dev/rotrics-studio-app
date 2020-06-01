// 左侧tap
export const TAP_LASER = "TAP_LASER";
export const TAP_P3D = "TAP_P3D";
export const TAP_CODE = "TAP_CODE";
export const TAP_SETTINGS = "TAP_SETTINGS";

// tool path渲染方式，line or point
// default line
// 添加在gcode的第一行
export const TOOL_PATH_RENDER_METHOD_LINE = ';TOOL_PATH_RENDER_METHOD_LINE';
export const TOOL_PATH_RENDER_METHOD_POINT = ';TOOL_PATH_RENDER_METHOD_POINT';

// p3d
export const P3D_SLICE_START = 'P3D_SLICE_START';
export const P3D_SLICE_PROGRESS = 'P3D_SLICE_PROGRESS';
export const P3D_SLICE_END = 'P3D_SLICE_END';
export const P3D_SLICE_ERROR = 'P3D_SLICE_ERROR';

// serial port
export const SERIAL_PORT_GET_PATH = 'SERIAL_PORT_GET_PATH'; //获取串口paths
export const SERIAL_PORT_GET_OPENED = 'SERIAL_PORT_GET_OPENED'; //获取opened的串口
export const SERIAL_PORT_OPEN = 'SERIAL_PORT_OPEN';
export const SERIAL_PORT_CLOSE = 'SERIAL_PORT_CLOSE';
export const SERIAL_PORT_ERROR = 'SERIAL_PORT_ERROR';
export const SERIAL_PORT_DATA = 'SERIAL_PORT_DATA';
export const SERIAL_PORT_WRITE = 'SERIAL_PORT_WRITE'; //通过serial port发送数据，比如：固件升级相关数据，单条gcode等

// gcode
export const GCODE_UPDATE_SENDER_STATUS = 'GCODE_UPDATE_SENDER_STATUS'; //更新gcode sender状态：sending/end/stopped/paused?
export const GCODE_START_SEND = 'GCODE_START_SEND'; //马上发送指定gcode，收到ok后发送下一条
export const GCODE_STOP_SEND = 'GCODE_STOP_SEND'; //马上停止发送gcode，并清空gcode发送队列
export const GCODE_APPEND_SEND = 'GCODE_APPEND_SEND'; //将指定的gcode追加到发送队列尾部

// tool path
export const TOOL_PATH_GENERATE_LASER = 'TOOL_PATH_GENERATE_LASER';

