import React from 'react';
import {connect} from 'react-redux';
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend.js";
import Line from '../../../../components/Line/Index.jsx'
import {Space, Button, Select} from 'antd';
import front_end from "../../lib/settings/front_end.json";
import Tooltip from '../../../Tooltip/Index.jsx';
import {withTranslation} from 'react-i18next';

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
            this.props.startTask(front_end[frontEnd].gcode);
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
            };
            reader.readAsText(file, "utf8");
        },
        startTask: () => {
            this.props.startTask(this.state.gcode);
            this.setState({importLevel: 3});
        },
        stopTask: () => {
            this.props.stopTask();
        },
    };

    render() {
        const {t} = this.props;
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
                <Space direction={"vertical"} style={{width: "100%", padding: "6px"}}>
                    <Tooltip title={t('Select the right module and set work origin first.')}>
                        <Button
                            style={{width: "100%"}}
                            onClick={this.actions.importGcode}
                        >
                            {t("Import G-code")}
                        </Button>
                    </Tooltip>
                    {this.state.importLevel > 0 &&
                    <Select
                        style={{width: "100%", textAlign: "center"}}
                        onChange={this.actions.onSelectFrontEnd}
                        placeholder={t('select front end')}
                        options={frontEndOptions}/>
                    }
                    {this.state.importLevel > 1 &&
                    <Button
                        style={{width: "100%"}}
                        onClick={this.actions.startTask}
                    >
                        {t("Start Send")}
                    </Button>}
                    {this.state.importLevel > 2 &&
                    <Button
                        style={{width: "100%"}}
                        onClick={this.actions.stopTask}
                    >
                        {t("Stop Send")}
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
        startTask: (gcode) => dispatch(gcodeSendActions.startTask(gcode)),
        stopTask: () => dispatch(gcodeSendActions.stopTask()),
    };
};
export default connect(null, mapDispatchToProps)(withTranslation()(Index));

