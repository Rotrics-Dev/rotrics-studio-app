import React from 'react';
import {connect} from 'react-redux';
import DeviceControl from "../../../_deviceControl/Index.jsx"
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import {Row, Col} from 'antd';

class Index extends React.Component {
    render() {
        return (
            <div>
                <DeviceControl hideRunBoundary={true}/>
            </div>
        )
    }
}

export default Index;

