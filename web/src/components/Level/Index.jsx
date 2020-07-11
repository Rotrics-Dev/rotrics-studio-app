import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import styles from './styles.css';
import {Radio, Space, Modal, message, Button,} from 'antd';
import {actions as serialPortActions} from "../../reducers/serialPort";

const INIT_Z_ARRAY = [
    undefined,
    undefined,
    undefined,
    undefined
]
const POINT_NAME = ['A', 'B', 'C', 'D'];
const POINT_STYLE = [styles.img_point_a, styles.img_point_b, styles.img_point_c, styles.img_point_d];

class Index extends React.Component {
    state = {
        showModal: false,
        pointIndex: undefined,
        accuracy: 0.1,
        zArray: INIT_Z_ARRAY,
        lastConnectSerialPort: undefined,
        started: false,
        serialPortState: null,
        showLoading: false
    }

    onSetPoint = (event) => {
        const index = event.target.value;
        let gcode = '';
        switch (index) {
            case 0://A
                gcode = 'G0 X0 Y350 Z0';
                break;
            case 1://B
                gcode = 'G0 X0 Y250 Z0';
                break;
            case 2://C
                gcode = 'G0 X50 Y300 Z0';
                break;
            case 3://D
                gcode = 'G0 X-50 Y300 Z0';
                break;
        }
        this.props.serialPortWrite(gcode + '\n');
        this.setState({
            pointIndex: index
        });
    }

    onSetAccuracy = (event) => {
        this.setState({
            accuracy: event.target.value
        })
    }

    onClickSave = () => {
        if (this.state.pointIndex === undefined) {
            message.error('You should choose one point first!');
            return;
        }
        const pointIndex = this.state.pointIndex;
        this.props.addLevelPositionListener((x, y, z) => {
            const zArray = _.cloneDeep(this.state.zArray);
            zArray[pointIndex] = z;
            this.setState({zArray});
        });
        this.props.serialPortWrite('M114\n');
        message.success(`Point ${POINT_NAME[pointIndex]} was saved.`);
    }
    onClickStart = () => {
        const gcode = [
            'M891 X0 Y0',
            'M2007'
        ];
        this.props.serialPortWrite(gcode.join('\n') + '\n');
        this.delayToConnectSerialPort(this, true, true, 'Level Started');
        this.setState({showLoading: true});
    }

    onClickLevel = () => {
        for (let index = 0; index < this.state.zArray.length; index++) {
            if (this.state.zArray[index] === undefined) {
                message.error(`Point ${POINT_NAME[index]} need to be saved.`);
                return;
            }
        }
        const zArray = this.state.zArray;
        const gcode = [
            `M891 X${(zArray[2] - zArray[3]) / 100} Y${(zArray[0] - zArray[1]) / 100}`,
            'M2007'
        ];
        this.props.serialPortWrite(gcode.join('\n') + '\n');
        this.delayToConnectSerialPort(this, false, false, 'Level Done,you could reconnect the device.');
        this.setState({showLoading: true});
    }
    delayToConnectSerialPort = (that, showModal, setStarted, msg) => {
        setTimeout(() => {
            const {lastConnectSerialPort} = that.state;
            const {paths} = that.props;
            if ((!paths) || (!paths.length)) {
                this.delayToConnectSerialPort(that, showModal, msg);
                return;
            }
            if (paths.indexOf(lastConnectSerialPort) === -1) {
                message.error('Device not Found');
                this.setState({showModal: false, showLoading: false});
                //找不到之前的串口
            } else {
                //连接之前串口
                this.props.openSerialPort(lastConnectSerialPort);
                this.delayToM1112(that, showModal, setStarted, msg);
            }
        }, 1000);
    }
    delayToM1112 = (that, showModal, setStarted, msg) => {
        setTimeout(() => {
            const {path} = that.props;
            if (!path) {
                this.delayToM1112(that, showModal, setStarted, msg);
                return;
            }

            that.props.serialPortWrite('M1112\n');
            message.success(msg);
            that.setState({
                showModal,
                started: setStarted,
                showLoading: false
            });
        }, 1000);
    }
    onClickDown = () => {
        this.move(`G0 Z${-this.state.accuracy}`);
    }

    onClickUp = () => {
        this.move(`G0 Z${this.state.accuracy}`);
    }

    move = (cmd) => {
        const gcode = [
            'G91',//relative position
            cmd,
            'G90'//absolute position
        ];
        this.props.serialPortWrite(gcode.join("\n") + '\n');
    }

    showModal = () => {
        const {path} = this.props;
        if (!path) {
            message.error('You should connect the device first.');
            return;
        }
        this.setState({
            showModal: true,
            pointIndex: undefined,
            accuracy: 10,
            zArray: INIT_Z_ARRAY,
            lastConnectSerialPort: path,
            started: false,
            showLoading: false
        });
    };

    render() {
        const {showLevel} = this.props;
        const {pointIndex} = this.state;
        return (<div>
                {showLevel && <button
                    onClick={this.showModal}
                    className={styles.btn_action_work}
                >Level
                </button>}

                <Modal
                    title="Leveling"
                    visible={this.state.showModal}
                    width={1000}
                    footer={null}
                    centered={true}
                    onCancel={() => {
                        this.setState({showModal: false})
                    }}
                >
                    <Space direction={"horizontal"} align={"start"}>
                        <Space direction={"vertical"}>
                            <div> Before start bed leveling, put a piece of paper between the module and the build
                                plate. And follow the instructions to level your DexArm.
                            </div>

                            <div style={{marginTop: "10px"}}><b>Step 1:</b> Click the button to reset DexArm's XY slope
                                rate. Wait about 4 seconds, the machine will be reconnected.
                            </div>
                            <Button size={"small"} onClick={this.onClickStart}>
                                Reset XY Slope Rate</Button>
                            <div style={{marginTop: "10px"}}><b>Step 2:</b> Click the first point to start leveling.
                            </div>
                            <Radio.Group
                                size={"small"}
                                value={this.state.pointIndex}
                                buttonStyle="solid"
                                disabled={!this.state.started}
                                onChange={this.onSetPoint}>
                                <Radio.Button value={0}>Point A</Radio.Button>
                                <Radio.Button value={1}>Point B</Radio.Button>
                                <Radio.Button value={2}>Point C</Radio.Button>
                                <Radio.Button value={3}>Point D</Radio.Button>
                            </Radio.Group>

                            <div style={{marginTop: "10px"}}><b>Step 3:</b> Adjust the distance between the module and
                                build plate using the Up and Down button until there is slight resistance on the A4
                                paper from the nozzle.
                            </div>
                            <div style={{opacity: 0.5}}>Accuracy</div>

                            <Radio.Group size={"small"} value={this.state.accuracy} buttonStyle="solid"
                                         onChange={this.onSetAccuracy}>
                                <Radio.Button value={10}>10</Radio.Button>
                                <Radio.Button value={1.0}>1.0</Radio.Button>
                                <Radio.Button value={0.2}>0.2</Radio.Button>
                                <Radio.Button value={0.1}>0.1</Radio.Button>
                            </Radio.Group>
                            <Space direction={"horizontal"}>
                                <Button size={"small"} style={{width: "61px"}} onClick={this.onClickDown}>Down</Button>
                                <Button size={"small"} style={{width: "61px"}} onClick={this.onClickUp}>Up</Button>
                            </Space>
                            <Button size={"small"} style={{width: "130px"}} onClick={this.onClickSave}>Save</Button>

                            <div style={{marginTop: "10px"}}><b>Step 4:</b> Click Level when all the points are leveled.
                            </div>
                            <Button size={"small"} style={{width: "130px"}} onClick={this.onClickLevel}>Level</Button>
                        </Space>
                        <Space>
                            <img className={POINT_STYLE[pointIndex ? pointIndex : 0]}/>
                        </Space>
                        <div
                            className={this.state.showLoading ? styles.div_loading_visible : styles.div_loading_hidden}>
                            <div className={styles.loading1}>
                                <span></span>
                                <span></span>
                                <span></span>{/*进度条 勿删*/}
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </Space>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {path, paths} = state.serialPort;
    return {
        path,
        paths
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        addLevelPositionListener: (listener) => {
            serialPortActions.addLevelPositionListener(listener);
        },
        serialPortWrite: (gcode) => {
            dispatch(serialPortActions.write(gcode));
        },
        openSerialPort: (path) => dispatch(serialPortActions.open(path)),
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(Index);
