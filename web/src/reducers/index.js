import {combineReducers} from 'redux';
import gcodeSend from "./gcodeSend";
import hotKeys from "./hotKeys";
import laser from "./laser";
import writeAndDraw from "./writeAndDraw";
import p3dMaterial from "./p3dMaterial";
import p3dModel from "./p3dModel";
import p3dSetting from "./p3dSetting";
import serialPort from "./serialPort";
import settings from "./settings";
import socket from "./socket";
import taps from "./taps";
import vm from "./vm";

export default combineReducers({
    gcodeSend,
    hotKeys,
    laser,
    writeAndDraw,
    // p3d,
    p3dMaterial,
    p3dModel,
    p3dSetting,
    serialPort,
    settings,
    socket,
    taps,
    vm,
});
