import {combineReducers} from 'redux';
import gcodeSend from "./gcodeSend";
import hotKeys from "./hotKeys";
import teachAndPlay from "./teachAndPlay";
import laser from "./laser";
import writeAndDraw from "./writeAndDraw";
import p3dModel from "./p3dModel";
import p3dConfigMaterial from "./p3dConfigMaterial";
import p3dConfigOthers from "./p3dConfigOthers";
import p3dConfigVisibility from "./p3dConfigVisibility";
import serialPort from "./serialPort";
import socket from "./socket";
import taps from "./taps";
import code from "./code";
import settingsGeneral from "./settingsGeneral";
import persistentData from "./persistentData";

export default combineReducers({
    gcodeSend,
    hotKeys,
    teachAndPlay,
    laser,
    writeAndDraw,
    // p3d
    p3dModel,
    p3dConfigMaterial,
    p3dConfigOthers,
    p3dConfigVisibility,
    serialPort,
    socket,
    taps,
    code,
    settingsGeneral,
    persistentData
});
