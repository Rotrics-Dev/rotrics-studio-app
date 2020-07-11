import React from 'react';
import {connect} from 'react-redux';
import Draggable from 'react-draggable';
import {Button, Input, Checkbox} from 'antd';
import styles from './styles.css';
import {actions as serialPortActions} from "../../../reducers/serialPort";
import {actions as tapsActions} from "../../../reducers/taps"
import socketClientManager from "../../../socket/socketClientManager";
import {SERIAL_PORT_DATA} from "../../../constants";

const MAX_LINE_COUNT = 150; //最多可展示多少条数据

class Index extends React.Component {
    constructor(props) {
        super(props);
        this.refTextArea = React.createRef();
    }

    state = {
        gcode: "",
        receivedLines: [],
        autoScroll: true
    };

    componentDidMount() {
        socketClientManager.addServerListener(SERIAL_PORT_DATA, (data) => {
            //达到上限则删除部分数据
            if (this.state.receivedLines.push(data.received) > MAX_LINE_COUNT) {
                this.state.receivedLines.splice(0, MAX_LINE_COUNT / 3)
            }
            const receivedLines = _.cloneDeep(this.state.receivedLines);
            this.setState({receivedLines})
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
            this.setState({receivedLines: []})
        },
        close: () => {
            this.props.setSerialPortAssistantVisible(false)
        },
        toggleAutoScroll: (e) => {
            this.setState({autoScroll: e.target.checked})
        }
    };

    render() {
        if (!this.props.serialPortAssistantVisible) {
            return null;
        }
        const actions = this.actions;
        const state = this.state;
        return (
            <Draggable>
                <div className={styles.div_fix}>
                    <div  style={{marginBottom: "5px"}}>
                        <Input
                            onPressEnter={actions.sendGcode}
                            onChange={actions.onChangeGcode}
                            placeholder="send gcode"
                            style={{width: "327px", marginRight: "5px"}}
                            allowClear={true}
                            size="small"
                        />
                        <Button
                            type="primary"
                            size="small"
                            onClick={actions.sendGcode}>
                            Send
                        </Button>
                    </div>
                    <Input.TextArea
                        ref={this.refTextArea}
                        className={styles.textarea_received}
                        size="small"
                        allowClear={true}
                        value={state.receivedLines.join("\n")}
                        disabled={true}
                    />
                    <Checkbox
                        style={{position: "absolute", bottom: "5px", left: "8px"}}
                        onChange={actions.toggleAutoScroll}
                        checked={state.autoScroll}>
                        Auto Scroll
                    </Checkbox>
                    <Button
                        className={styles.btn_close}
                        ghost
                        type="primary"
                        size="small"
                        onClick={actions.close}>
                        Close
                    </Button>
                    <Button
                        ghost
                        className={styles.btn_clear}
                        type="primary"
                        size="small"
                        onClick={actions.clearReceivedLines}>
                        Clear
                    </Button>
                </div>
            </Draggable>
        )
    }
}

const mapStateToProps = (state) => {
    const {serialPortAssistantVisible} = state.taps;
    return {
        serialPortAssistantVisible
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        writeSerialPort: (str) => dispatch(serialPortActions.write(str)),
        setSerialPortAssistantVisible: (value) => dispatch(tapsActions.setSerialPortAssistantVisible(value))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
