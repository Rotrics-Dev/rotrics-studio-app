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
            this.props.write("M1112")
        },
        xPlus: () => {
            this.actions._move(`G0 X${this.state.step}`)
        },
        xMinus: () => {
            this.actions._move(`G0 X${-this.state.step}`)
        },
        yPlus: () => {
            this.actions._move(`G0 Y${this.state.step}`)
        },
        yMinus: () => {
            this.actions._move(`G0 Y${-this.state.step}`)
        },
        zPlus: () => {
            this.actions._move(`G0 Z${this.state.step}`)
        },
        zMinus: () => {
            this.actions._move(`G0 Z${-this.state.step}`)
        },
        z0: () => {
            this.props.write("G0 Z0")
        },
        leftTop: () => {
            this.actions._move(`G0 Y${this.state.step} Z${this.state.step}`)
        },
        leftBottom: () => {
            this.actions._move(`G0 Y${this.state.step} Z${-this.state.step}`)
        },
        rightTop: () => {
            this.actions._move(`G0 Y${-this.state.step} Z${this.state.step}`)
        },
        rightBottom: () => {
            this.actions._move(`G0 Y${-this.state.step} Z${-this.state.step}`)
        },
        setStep: (e) => {
            this.setState({step: e.target.value})
        },
        runBoundary: () => {
            console.log("runBoundary")
        },
        setWorkOrigin: () => {
            this.props.write("G92 X0 Y0 Z0")
        },
        goToWorkOrigin: () => {
            this.props.write("G0 X0 Y0 Z0")
        },
        _move: (moveStr) => {
            const arr = [];
            arr.push('G91')
            arr.push(moveStr);
            arr.push('G90');
            const gcode = arr.join("\n");
            console.log(gcode)
            this.props.loadGcode(gcode);
            this.props.startSendGcode();
        }
    };

    render() {
        const actions = this.actions;
        const state = this.state;
        return (
            <div>
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
        loadGcode: (str) => dispatch(serialPortActions.loadGcode(str)),
        startSendGcode: () => dispatch(serialPortActions.startSendGcode()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);

