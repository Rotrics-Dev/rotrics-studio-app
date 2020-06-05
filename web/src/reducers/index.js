import {combineReducers} from 'redux';
import gcodeSend from "./gcodeSend";
import hotKeys from "./hotKeys";
import laser from "./laser";
import laserText from "./laserText";
import writeAndDraw from "./writeAndDraw";
import writeAndDrawText from "./writeAndDrawText"
import p3d from "./p3d";
import p3dConfig from "./p3dConfig";
import p3dGcode from "./p3dGcode";
import p3dMaterial from "./p3dMaterial";
import p3dModel from "./p3dModel";
import serialPort from "./serialPort";
import socket from "./socket";
import tap from "./tap";
import vm from "./vm";

export default combineReducers({
    gcodeSend,
    hotKeys,
    laser,
    laserText,
    writeAndDraw,
    writeAndDrawText,
    p3d,
    p3dConfig,
    p3dGcode,
    p3dMaterial,
    p3dModel,
    serialPort,
    socket,
    tap,
    vm,
});
