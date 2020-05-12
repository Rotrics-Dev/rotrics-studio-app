import React from 'react';
import styles from './styles.css';
import socketManager from "../../socket/socketManager"
import {Select, Button, Input} from 'antd';

class Socket extends React.Component {
    state = {
        path: "",
        paths: [],
        socketStatus: "",
        serialPortStatus: "",
        gcode: ""
    };

    componentDidMount() {
        socketManager.on('on-socket-connect', () => {
            this.setState({socketStatus: "connect"})
        });
        socketManager.on('on-socket-disconnect', () => {
            this.setState({socketStatus: "disconnect"})
        });

        //serial port
        socketManager.on("on-serialPort-query", (data) => {
            this.setState({paths: data.paths})
        });
        socketManager.on("on-serialPort-open", (data) => {
            this.setState({serialPortStatus: "open"})
        });
        socketManager.on("on-serialPort-close", (data) => {
            this.setState({serialPortStatus: "close"})
        });
        socketManager.on("on-serialPort-error", (data) => {
            this.setState({serialPortStatus: "err"})
        });
        socketManager.on("on-serialPort-data", (data) => {
            console.log("on-serialPort-data: " + JSON.stringify(data))
            const lines = data.received.replace(/(\r\n|\r|\n)/g, '\n').split('\n');
            //下一条gcode要等到上一条的ok后，再发送
            console.log(JSON.stringify(lines))
        });
    }

    actions = {
        setupSocket: () => {
            socketManager.setup();
        },
        querySerialPort: () => {
            socketManager.querySerialPort();
        },
        changeSerialPort: (path) => {
            this.setState({path})
        },
        openSerialPort: () => {
            socketManager.openSerialPort(this.state.path)
        },
        closeSerialPort: () => {
            socketManager.closeSerialPort(this.state.path)
        },
        writeGcodeSerialPort: () => {
            socketManager.writeGcodeSerialPort(this.state.gcode)
        },
        changeGcode: (e) => {
            this.setState({gcode: e.target.value})
        },
    };

    render() {
        const actions = this.actions;
        const state = this.state;
        return (
            <div>
                <h2>{"DebugSocket"}</h2>
                <h3>socket : {state.socketStatus}</h3>
                <h3>serialPort : {state.serialPortStatus}</h3>
                <Select style={{width: 300}} onChange={actions.changeSerialPort}>
                    {state.paths.map((item) => {
                        return <Select.Option key={item} value={item}>{item}</Select.Option>
                    })}
                </Select>
                <br/><br/>
                <Button onClick={actions.setupSocket}>setupSocket</Button>
                <Button onClick={actions.querySerialPort}>querySerialPort</Button>
                <Button onClick={actions.openSerialPort}>openSerialPort</Button>
                <Button onClick={actions.closeSerialPort}>closeSerialPort</Button>
                <br/><br/>
                <Input onChange={actions.changeGcode} style={{width: 300}}/>
                <Button onClick={actions.writeGcodeSerialPort}>writeGcodeSerialPort</Button>
            </div>
        )
    }
}

export default Socket;
