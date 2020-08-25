import {combineReducers} from 'redux';
import gcodeSend from "./gcodeSend";
import hotKeys from "./hotKeys";
import teachAndPlay from "./teachAndPlay";
import laser from "./laser";
import writeAndDraw from "./writeAndDraw";
import p3dModel from "./p3dModel";
import p3dMaterialSettings from "./p3dMaterialSettings";
import p3dPrintSettings from "./p3dPrintSettings";
import p3dSettingVisibility from "./p3dSettingVisibility";
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
    p3dMaterialSettings,
    p3dPrintSettings,
    p3dSettingVisibility,
    serialPort,
    socket,
    taps,
    code,
    settingsGeneral,
    persistentData
});
