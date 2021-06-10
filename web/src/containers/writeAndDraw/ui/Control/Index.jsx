import React from 'react';
import DeviceControl from "../../../_deviceControl/Index.jsx"
import {FRONT_END} from '../../../../utils/workAreaUtils.js'

class Index extends React.Component {
    render() {
        return (
            <div>
                <DeviceControl
                    frontEnd={FRONT_END.PEN}
                />
            </div>
        )
    }
}

export default Index;

