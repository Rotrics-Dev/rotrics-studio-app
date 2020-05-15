import React from 'react';
import styles from './styles.css';
import socketManager from "../../socket/socketManager"
import {Tabs, Modal, Select, Radio, Space} from 'antd';
import {actions as serialPortActions} from '../../reducers/serialPort';
import {connect} from 'react-redux';

const { TabPane } = Tabs;

class Index extends React.Component {
    state = {
        step: 10
    };

    actions = {
        callback: () => {

        }
    };

    render() {
        const actions = this.actions;
        const state = this.state;
        return (
            <div>
                <h2>{"DeviceControl"}</h2>
                <Tabs onChange={actions.callback} type="card">
                    <TabPane tab="Tab 1" key="1">
                        Content of Tab Pane 1
                    </TabPane>
                    <TabPane tab="Tab 2" key="2">
                        Content of Tab Pane 2
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}


const mapStateToProps = (state) => {
    const {serialPortStatus} = state.serialPort;
    return {
        serialPortStatus
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        write: (str) => dispatch(serialPortActions.write(str)),
        loadGcode: (str) => dispatch(serialPortActions.loadGcode(str)),
        startSendGcode: () => dispatch(serialPortActions.startSendGcode()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);

