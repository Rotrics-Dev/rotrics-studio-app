import React from 'react';
import {connect} from 'react-redux';
import Draggable from 'react-draggable';
import {Button, Input, Checkbox} from 'antd';
import styles from './styles.css';
import {actions as serialPortActions} from "../../../reducers/serialPort";
import {actions as tapsActions} from "../../../reducers/taps"
import socketClientManager from "../../../socket/socketClientManager";
import {SERIAL_PORT_DATA} from "../../../constants";
import {withTranslation} from 'react-i18next';

const MAX_LINE_COUNT = 150; //最多可展示多少条数据

class Index extends React.Component {
    constructor(props) {
        super(props);
        this.refTextArea = React.createRef();
    }

    state = {
        gcode: "",
        receivedLines4debug: [], //debug模式下，显示所有收到的数据
        receivedLines4normal: [], //normal模式下，不显示ok，wait
        autoScroll: true,
        debug: false
    };

    componentDidMount() {
        socketClientManager.addServerListener(SERIAL_PORT_DATA, (data) => {
            //达到上限则删除部分数据
            if (this.state.receivedLines4debug.push(data.received) > MAX_LINE_COUNT) {
                this.state.receivedLines4debug.splice(0, MAX_LINE_COUNT / 3)
            }
            const receivedLines4debug = _.cloneDeep(this.state.receivedLines4debug);
            const receivedLines4normal = receivedLines4debug.filter((value) => {
                return !["ok", "wait"].includes(value);
            });
            this.setState({receivedLines4debug, receivedLines4normal});
            if (this.state.autoScroll) {
                if (this.refTextArea.current) {
                    const textArea = this.refTextArea.current.resizableTextArea.textArea;
                    textArea.scrollTop = textArea.scrollHeight;
                }
            }
        });
    }

    actions = {
        sendGcode: () => {
            const gcode = this.state.gcode;
            this.props.writeSerialPort(gcode + "\n")
        },
        onChangeGcode: (e) => {
            const gcode = e.target.value;
            this.setState({gcode})
        },
        clearReceivedLines: () => {
            this.setState({receivedLines4debug: [], receivedLines4normal: []})
        },
        close: () => {
            this.props.setTerminalVisible(false)
        },
        toggleAutoScroll: (e) => {
            this.setState({autoScroll: e.target.checked})
        },
        toggleDebug: (e) => {
            this.setState({debug: e.target.checked})
        }
    };

    render() {
        if (!this.props.terminalVisible) {
            return null;
        }
        const actions = this.actions;
        const state = this.state;
        const {t} = this.props;
        return (
            <Draggable>
                <div className={styles.div_fix}>
                    <div style={{marginBottom: "5px"}}>
                        <Input
                            onPressEnter={actions.sendGcode}
                            onChange={actions.onChangeGcode}
                            placeholder={t("send g-code")}
                            style={{width: "327px", marginRight: "5px"}}
                            allowClear={true}
                            size="small"
                        />
                        <Button
                            type="primary"
                            size="small"
                            onClick={actions.sendGcode}>
                            {t("Send")}
                        </Button>
                    </div>
                    <Input.TextArea
                        ref={this.refTextArea}
                        className={styles.textarea_received}
                        size="small"
                        allowClear={true}
                        value={state.debug ? state.receivedLines4debug.join("\n") : state.receivedLines4normal.join("\n")}
                        disabled={true}
                    />
                    <Checkbox
                        style={{fontSize: "13px", position: "absolute", bottom: "1px", left: "8px"}}
                        onChange={actions.toggleAutoScroll}
                        checked={state.autoScroll}>
                        {t("Auto Scroll")}
                    </Checkbox>
                    <Checkbox
                        style={{fontSize: "13px", position: "absolute", bottom: "22px", left: "0px"}}
                        onChange={actions.toggleDebug}
                        checked={state.debug}>
                        {t("Debug")}
                    </Checkbox>
                    <Button
                        className={styles.btn_close}
                        ghost
                        type="primary"
                        size="small"
                        onClick={actions.close}>
                        {t("Close")}
                    </Button>
                    <Button
                        ghost
                        className={styles.btn_clear}
                        type="primary"
                        size="small"
                        onClick={actions.clearReceivedLines}>
                        {t("Clear")}
                    </Button>
                </div>
            </Draggable>
        )
    }
}

const mapStateToProps = (state) => {
    const {terminalVisible} = state.taps;
    return {
        terminalVisible
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        writeSerialPort: (str) => dispatch(serialPortActions.write(str)),
        setTerminalVisible: (value) => dispatch(tapsActions.setTerminalVisible(value))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));
