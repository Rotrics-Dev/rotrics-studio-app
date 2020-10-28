import React from 'react';
import {Space} from 'antd';
import DevSerialPortMonitor from './dev-serial-port-monitor/Index.jsx';
import DevControlPanel from './dev-control-panel/Index.jsx';
import DevSerialPortConnection from './dev-serial-port-connection/Index.jsx';
import P3dCalibration from './p3d-calibration/Index.jsx'
import NavGcodeAction from './nav-gcode-action/Index.jsx'
import NavGcodeSend from './nav-gcode-send/Index.jsx'
import NavDev from './nav-dev/Index.jsx'
import NavLink from './nav-link/Index.jsx'

class Index extends React.Component {
    render() {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "space-between"
                }}>
                <DevSerialPortConnection/>
                <DevSerialPortMonitor/>
                <DevControlPanel/>
                <P3dCalibration/>
                <Space size={40} style={{marginLeft: "5px"}}>
                    <NavGcodeAction/>
                    <NavGcodeSend/>
                    <NavDev/>
                </Space>
                <div style={{position: "absolute", right: "5px", top: "10px"}}>
                    <NavLink/>
                </div>
            </div>
        )
    }
}

export default Index;
