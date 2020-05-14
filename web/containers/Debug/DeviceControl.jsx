import React from 'react';
import styles from './styles.css';
import socketManager from "../../socket/socketManager"
import {Button, Modal, Select, Radio, Space} from 'antd';
import {actions as serialPortActions} from '../../reducers/serialPort';
import {connect} from 'react-redux';

class Index extends React.Component {
    state = {
        step: 10
    };

    actions = {
        home: () => {
            console.log("home")
            this.props.write("M1112")
        },
        xPlus: () => {
            console.log("xPlus")
        },
        xMinus: () => {
            console.log("xMinus")
        },
        yPlus: () => {
            console.log("yPlus")
        },
        yMinus: () => {
            console.log("yMinus")
        },
        zPlus: () => {
            console.log("zPlus")
        },
        zMinus: () => {
            console.log("zMinus")
        },
        z0: () => {
            console.log("z0")
        },
        leftTop: () => {
            console.log("leftTop")
        },
        leftBottom: () => {
            console.log("leftBottom")
        },
        rightTop: () => {
            console.log("rightTop")
        },
        rightBottom: () => {
            console.log("rightBottom")
        },
        setStep: (e) => {
            this.setState({step: e.target.value})
        },
        runBoundary: () => {
            console.log("runBoundary")
        },
        setWorkOrigin: () => {
            console.log("setWorkOrigin")
        },
        goToWorkOrigin: () => {
            console.log("goToWorkOrigin")
        },
    };

    render() {
        const actions = this.actions;
        const state = this.state;
        return (
            <div>
                <h2>{"DeviceControl"}</h2>
                <Space direction={"vertical"}>
                    <Space direction={"horizontal"}>
                        <button
                            onClick={actions.leftTop}
                            className={styles.btn_left_top}
                        />
                        <button
                            onClick={actions.yPlus}
                            className={styles.btn_xyz}
                        >Y+
                        </button>
                        <button
                            onClick={actions.rightTop}
                            className={styles.btn_right_top}
                        />
                        <button
                            onClick={actions.zPlus}
                            className={styles.btn_xyz}
                        >Z+
                        </button>
                    </Space>
                    <Space direction={"horizontal"}>
                        <button
                            onClick={actions.xMinus}
                            className={styles.btn_xyz}
                        >X-
                        </button>
                        <button
                            onClick={actions.home}
                            className={styles.btn_xyz}
                        >Home
                        </button>
                        <button
                            onClick={actions.xPlus}
                            className={styles.btn_xyz}
                        >X+
                        </button>
                        <button
                            onClick={actions.z0}
                            className={styles.btn_xyz}
                        >Z0
                        </button>
                    </Space>
                    <Space direction={"horizontal"}>
                        <button
                            onClick={actions.leftBottom}
                            className={styles.btn_left_bottom}
                        />
                        <button
                            onClick={actions.yMinus}
                            className={styles.btn_xyz}
                        >Y-
                        </button>
                        <button
                            onClick={actions.rightBottom}
                            className={styles.btn_right_bottom}
                        />
                        <button
                            onClick={actions.zMinus}
                            className={styles.btn_xyz}
                        >Z-
                        </button>
                    </Space>
                    <button
                        onClick={actions.runBoundary}
                        className={styles.btn_action_work}
                    >Run Boundary
                    </button>
                    <button
                        onClick={actions.goToWorkOrigin}
                        className={styles.btn_action_work}
                    >Go To Work Origin
                    </button>
                    <button
                        onClick={actions.setWorkOrigin}
                        className={styles.btn_action_work}
                    >Set Work Origin
                    </button>
                    <Radio.Group value={state.step} buttonStyle="solid" onChange={actions.setStep}>
                        <Radio.Button value={10} className={styles.btn_step}>10</Radio.Button>
                        <Radio.Button value={1} className={styles.btn_step}>1</Radio.Button>
                        <Radio.Button value={0.2} className={styles.btn_step}>0.2</Radio.Button>
                        <Radio.Button value={0.1} className={styles.btn_step}>0.1</Radio.Button>
                    </Radio.Group>
                </Space>
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
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);

