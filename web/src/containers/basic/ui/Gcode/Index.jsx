import React from 'react';
import {connect} from 'react-redux';
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend.js";
import Line from '../../../../components/Line/Index.jsx'
import {Space, Button, Select, message} from 'antd';
import front_end from "../../lib/settings/front_end.json";
import ReactTooltip from "react-tooltip";
import {getUuid} from '../../../../utils';

const tooltipId = getUuid();

class Index extends React.Component {
    fileInput = React.createRef();
    state = {
        gcode: null, //
        fileName: null,
        importLevel: 0// int
    };
    actions = {
        onSelectFrontEnd: (frontEnd) => {
            if (!frontEnd) {
                return;
            }
            this.props.startSendGcode(front_end[frontEnd].gcode);
            this.setState({importLevel: 2});
        },
        importGcode: () => {
            this.setState({
                gcode: null, // bw, greyscale, svg, text
                fileName: null,
                importLevel: 0// int
            }, () => {
                this.fileInput.current.value = null;
                this.fileInput.current.click();
            })
        },
        onChangeFile: async (event) => {
            const file = event.target.files[0];
            const reader = new FileReader();
            const that = this;
            reader.onload = function () {
                that.setState({
                    gcode: this.result, // bw, greyscale, svg, text
                    fileName: file.name,
                    importLevel: 1
                });
            }
            reader.readAsText(file, "utf8");
        },
        startSendGcode: () => {
            this.props.startSendGcode(this.state.gcode);
            this.setState({importLevel: 3});
        },
        stopSendGcode: () => {
            this.props.stopSendGcode();
        }
    };

    render() {
        // const actions = this.actions;
        // const {jog_pen_offset} = this.props;

        const frontEndOptions = [];
        Object.keys(front_end).forEach((key) => {
            const option = front_end[key];
            frontEndOptions.push({value: key, label: option.label})
        });

        return (
            <div style={{
                width: "100%",
                height: "100%",
            }}>
                <ReactTooltip
                    id={tooltipId}
                    place="left"
                    type="info"
                    effect="solid"
                    backgroundColor="#c0c0c0"
                    textColor="#292421"
                    delayShow={200}/>
                <ReactTooltip/>
                <Space direction={"vertical"} style={{width: "100%", padding: "6px"}}>
                    <Button
                        data-for={tooltipId}
                        // data-tip="Make sure that work origin had been setup before import 3rd part gcode."
                        // data-tip="Select the right module to set the end effector offset before setting work origin."
                        data-tip="Select the right module and set work origin first."
                        style={{width: "100%"}}
                        onClick={this.actions.importGcode}
                    >
                        {"Import G-code"}
                    </Button>
                    {this.state.importLevel > 0 &&
                    <Select
                        style={{width: "100%", textAlign: "center"}}
                        onChange={this.actions.onSelectFrontEnd}
                        placeholder="select a front end"
                        options={frontEndOptions}/>
                    }
                    {this.state.importLevel > 1 &&
                    <Button
                        style={{width: "100%"}}
                        onClick={this.actions.startSendGcode}
                    >
                        {"Start Send"}
                    </Button>}
                    {this.state.importLevel > 2 &&
                    <Button
                        style={{width: "100%"}}
                        onClick={this.actions.stopSendGcode}
                    >
                        {"Stop Send"}
                    </Button>}
                </Space>
                <Line/>
                <input
                    ref={this.fileInput}
                    type="file"
                    accept={".gcode"}
                    style={{display: 'none'}}
                    multiple={false}
                    onChange={this.actions.onChangeFile}
                />
                <Space direction={"vertical"} style={{width: "100%", paddingLeft: "5px", paddingRight: "5px"}}>
                    {this.state.fileName &&
                    <div style={{textAlign: "center"}}>
                        {this.state.fileName}
                    </div>}
                </Space>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        startSendGcode: (gcode) => dispatch(gcodeSendActions.start(gcode)),
        stopSendGcode: () => dispatch(gcodeSendActions.stop()),
    };
};

export default connect(null, mapDispatchToProps)(Index);

