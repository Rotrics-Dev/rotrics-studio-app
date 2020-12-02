import {combineReducers} from 'redux';
import gcodeSend from "./gcodeSend";
import hotKeys from "./hotKeys";
import teachAndPlay from "./teachAndPlay";
import model2d from "./model2d";
import p3dModel from "./p3dModel";
import p3dMaterialSettings from "./p3dMaterialSettings";
import p3dPrintSettings from "./p3dPrintSettings";
import p3dSettingVisibility from "./p3dSettingVisibility";
import serialPort from "./serialPort";
import socket from "./socket";
import taps from "./taps";
import code from "./code";
import codeProject from "./codeProject";
import settingsGeneral from "./settingsGeneral";
import fonts from "./fonts";
import header from "./header";
import appConfig from "./appConfig";

export default combineReducers({
    gcodeSend,
    hotKeys,
    teachAndPlay,
    model2d,
    p3dModel,
    p3dMaterialSettings,
    p3dPrintSettings,
    p3dSettingVisibility,
    serialPort,
    socket,
    taps,
    code,
    codeProject,
    settingsGeneral,
    fonts,
    header,
    appConfig
});
