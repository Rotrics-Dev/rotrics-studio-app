//tool path渲染方式，line or point
// default line
//添加在gcode的第一行
export const TOOL_PATH_RENDER_METHOD_LINE = ';TOOL_PATH_RENDER_METHOD_LINE';
export const TOOL_PATH_RENDER_METHOD_POINT = ';TOOL_PATH_RENDER_METHOD_POINT';

//p3d
export const P3D_SLICE_START = 'P3D_SLICE_START';
export const P3D_SLICE_PROGRESS = 'P3D_SLICE_PROGRESS';
export const P3D_SLICE_END = 'P3D_SLICE_END';
export const P3D_SLICE_ERROR = 'P3D_SLICE_ERROR';

//serial port
export const SERIAL_PORT_GET_PATH = 'SERIAL_PORT_GET_PATH'; //获取串口paths
export const SERIAL_PORT_GET_OPENED = 'SERIAL_PORT_GET_OPENED'; //获取opened的串口
export const SERIAL_PORT_OPEN = 'SERIAL_PORT_OPEN';
export const SERIAL_PORT_CLOSE = 'SERIAL_PORT_CLOSE';
export const SERIAL_PORT_ERROR = 'SERIAL_PORT_ERROR';
export const SERIAL_PORT_DATA = 'SERIAL_PORT_DATA';
export const SERIAL_PORT_WRITE = 'SERIAL_PORT_WRITE';

//gcode sender
export const GCODE_STATUS = 'GCODE_STATUS'; //sending/end/stopped/paused?
export const GCODE_SEND_START = 'GCODE_SEND_START';//开始发送制定的gcode
export const GCODE_SEND_STOP = 'GCODE_SEND_STOP';

//tool path
export const TOOL_PATH_GENERATE_LASER = 'TOOL_PATH_GENERATE_LASER';

