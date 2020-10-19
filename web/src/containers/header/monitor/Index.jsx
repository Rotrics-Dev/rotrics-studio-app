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
import InputWithHistory from '../../../components/InputWithHistory/Index.jsx';

const MAX_COUNT_RECEIVED_LINE = 150;

class Index extends React.Component {
    constructor(props) {
        super(props);
        this.refInputTextArea = React.createRef();
    }

    state = {
        position: {x: 0, y: 0},
        receivedLines: [],
        isAutoScrollEnabled: true,
        isUppercaseEnabled: true,
        isDebugEnabled: false,
        isTransparentEnabled: false,
    };

    componentDidMount() {
        socketClientManager.addServerListener(SERIAL_PORT_ON_RECEIVED_LINE, (line) => {
            if (this.state.receivedLines.push(line) > MAX_COUNT_RECEIVED_LINE) {
                this.state.receivedLines.splice(0, MAX_COUNT_RECEIVED_LINE / 3)
            }
            this.setState({receivedLines: _.cloneDeep(this.state.receivedLines)});
            if (this.state.isAutoScrollEnabled) {
                if (this.refInputTextArea.current) {
                    const textArea = this.refInputTextArea.current.resizableTextArea.textArea;
                    textArea.scrollTop = textArea.scrollHeight;
                }
            }
        });
    }

    actions = {
        onPressEnter: (value) => {
            this.props.writeSerialPort(value + '\n');
        },
        clearReceivedLines: () => {
            this.setState({receivedLines: []})
        },
        close: () => {
            this.props.changeVisible4monitor(false)
        },
        toggleAutoScroll: () => {
            const isAutoScrollEnabled = !this.state.isAutoScrollEnabled;
            this.setState({isAutoScrollEnabled})
        },
        toggleDebug: () => {
            const isDebugEnabled = !this.state.isDebugEnabled;
            this.setState({isDebugEnabled})
        },
        toggleTransparent: () => {
            const isTransparentEnabled = !this.state.isTransparentEnabled;
            this.setState({isTransparentEnabled})
        },
        toggleUppercase: () => {
            const isUppercaseEnabled = !this.state.isUppercaseEnabled;
            this.setState({isUppercaseEnabled})
        }
    };

    render() {
        if (!this.props.monitorVisible) {
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
                <div className={state.isTransparentEnabled ? styles.div_root_transparent : styles.div_root}>
                    <div id="handle" className={styles.div_header}>
                        <label className={styles.label_title}>{t('Monitor')}</label>
                        <Space size={0} className={styles.space}>
                            <input type="button"
                                   className={state.isAutoScrollEnabled ? styles.btn_auto_scroll_enabled : styles.btn_auto_scroll_disabled}
                                   onClick={actions.toggleAutoScroll}/>
                            <input type="button"
                                   className={state.isUppercaseEnabled ? styles.btn_uppercase_enabled : styles.btn_uppercase_disabled}
                                   onClick={actions.toggleUppercase}/>
                            <input type="button"
                                   className={state.isDebugEnabled ? styles.btn_debug_enabled : styles.btn_debug_disabled}
                                   onClick={actions.toggleDebug}/>
                            <input type="button" className={styles.btn_clear} onClick={actions.clearReceivedLines}/>
                            <input type="button" className={styles.btn_transparent}
                                   onClick={actions.toggleTransparent}/>
                            <input type="button" className={styles.btn_close} onClick={actions.close}/>
                        </Space>
                    </div>
                    <div className={styles.div_container}>
                        <InputWithHistory
                            allowClear={true}
                            size="small"
                            placeholder={t("press enter to send")}
                            className={styles.input_g_code}
                            onPressEnter={actions.onPressEnter}
                            isUppercaseEnabled={state.isUppercaseEnabled}
                        />
                        <Input.TextArea
                            ref={this.refInputTextArea}
                            className={styles.input_received}
                            size="small"
                            allowClear={true}
                            disabled={true}
                            value={
                                state.isDebugEnabled ? state.receivedLines.join('\n') : (state.receivedLines.filter(value => {
                                    return !["ok", "wait"].includes(value);
                                })).join('\n')
                            }
                        />
                    </div>
                </div>
            </Draggable>
        )
    }
}

const mapStateToProps = (state) => {
    const {monitorVisible} = state.header;
    return {
        monitorVisible
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        writeSerialPort: (str) => dispatch(serialPortActions.write(str)),
        changeVisible4monitor: (value) => dispatch(headerActions.changeVisible4monitor(value))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));
