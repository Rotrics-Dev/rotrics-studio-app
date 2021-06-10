import React from 'react';
import styles from './styles.css';
import DeviceControl from "../../../_deviceControl/Index.jsx"
import {FRONT_END} from "../../../../utils/workAreaUtils";

class Index extends React.Component {
    render() {
        return (
            <div>
                <DeviceControl 
                    showLevel={true}
                    frontEnd={FRONT_END.P3D}
                />
            </div>
        )
    }
}

export default Index;

