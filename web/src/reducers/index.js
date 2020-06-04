import {combineReducers} from 'redux';
import gcodeSend from "./gcodeSend";
import hotKeys from "./hotKeys";
import laser from "./laser";
import laserText from "./laserText";
import writeAndDraw from "./writeAndDraw";
import writeAndDrawText from "./writeAndDrawText"
import p3d from "./p3d";
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
    serialPort,
    socket,
    tap,
    vm,
});
