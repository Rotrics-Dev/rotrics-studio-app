import React from 'react';
import {connect} from 'react-redux';
import Draggable from 'react-draggable';
import {Space, Input} from 'antd';
import {withTranslation} from 'react-i18next';
import styles from './styles.css';
import {actions as serialPortActions} from "../../../reducers/serialPort";
import socketClientManager from "../../../socket/socketClientManager";
import {SERIAL_PORT_ON_RECEIVED_LINE} from "../../../constants";
import {actions as headerActions} from "../../../reducers/header";

const MAX_LINE_COUNT = 150; //最多可展示多少条数据

class Index extends React.Component {
    constructor(props) {
        super(props);
        this.refTextArea = React.createRef();
    }

    state = {
        transparent: false,
        position: {x: 0, y: 0},
        gcode: "",
        receivedLines4debug: [], //debug模式下，显示所有收到的数据
        receivedLines4normal: [], //normal模式下，不显示ok，wait
        autoScroll: true,
        debug: false
    };

    componentDidMount() {
        socketClientManager.addServerListener(SERIAL_PORT_ON_RECEIVED_LINE, (line) => {
            //达到上限则删除部分数据
            if (this.state.receivedLines4debug.push(line) > MAX_LINE_COUNT) {
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
            this.props.changeVisibility4terminal(false)
        },
        toggleAutoScroll: () => {
            const autoScroll = !this.state.autoScroll;
            this.setState({autoScroll})
        },
        toggleDebug: () => {
            const debug = !this.state.debug;
            this.setState({debug})
        },
        toggleTransparent: () => {
            const transparent = !this.state.transparent;
            this.setState({transparent})
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
            <Draggable
                handle="#handle"
                defaultPosition={state.position}
                onStop={(e, data) => {
                    const {x, y} = data;
                    this.setState({position: {x, y}})
                }}>
                <div className={state.transparent ? styles.div_root_transparent : styles.div_root}>
                    <div id="handle" className={styles.div_header}>
                        <label className={styles.label_title}>{t('Terminal')}</label>
                        <Space size={0} className={styles.space}>
                            <input type="button"
                                   className={state.autoScroll ? styles.btn_auto_scroll_enabled : styles.btn_auto_scroll_disabled}
                                   onClick={actions.toggleAutoScroll}/>
                            <input type="button"
                                   className={state.debug ? styles.btn_debug_enabled : styles.btn_debug_disabled}
                                   onClick={actions.toggleDebug}/>
                            <input type="button" className={styles.btn_clear} onClick={actions.clearReceivedLines}/>
                            <input type="button" className={styles.btn_transparent} onClick={actions.toggleTransparent}/>
                            <input type="button" className={styles.btn_close} onClick={actions.close}/>
                        </Space>
                    </div>
                    <div className={styles.div_container}>
                        <Input
                            onPressEnter={actions.sendGcode}
                            onChange={actions.onChangeGcode}
                            className={styles.input_g_code}
                            placeholder={t("press enter to send")}
                            allowClear={true}
                            size="small"
                        />
                        <Input.TextArea
                            ref={this.refTextArea}
                            className={styles.input_received}
                            size="small"
                            allowClear={true}
                            value={state.debug ? state.receivedLines4debug.join("\n") : state.receivedLines4normal.join("\n")}
                            disabled={true}
                        />
                    </div>
                </div>
            </Draggable>
        )
    }
}

const mapStateToProps = (state) => {
    const {terminalVisible} = state.header;
    return {
        terminalVisible
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        writeSerialPort: (str) => dispatch(serialPortActions.write(str)),
        changeVisibility4terminal: (value) => dispatch(headerActions.changeVisibility4terminal(value))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));
