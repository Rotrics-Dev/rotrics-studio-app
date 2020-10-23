import React from 'react';
import {Space} from 'antd';
import SettingVisibility from "./SettingVisibility.jsx";
import MaterialSettings from './MaterialSettings.jsx';
import PrintSettings from './PrintSettings.jsx';
import {TAP_P3D} from "../../../../constants.js";

class Index extends React.Component {
    render() {
        return (
            <div>
                <Space direction={"vertical"} size="small" style={{width: "100%", padding: "8px"}}>
                    <SettingVisibility/>
                    <MaterialSettings/>
                    <PrintSettings/>
                </Space>
            </div>
        )
    }
}

export default Index;

