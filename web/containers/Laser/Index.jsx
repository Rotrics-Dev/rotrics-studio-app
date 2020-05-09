import React from 'react';
import _ from 'lodash';
import FileSaver from 'file-saver';

import styles from './styles.css';
import CoordinateSystem2D from '../../components/CoordinateSystem2D/Index.jsx'
import laserManager from "../../laser/laserManager.js";
import {Button, Input} from 'antd';

import "antd/dist/antd.css";

import Transformation from './Transformation.jsx';

import ConfigGreyscale from './ConfigGreyscale.jsx';
import ConfigBW from './ConfigBW.jsx';
import ConfigSvg from './ConfigSvg.jsx';
import ConfigText from './ConfigText.jsx';

import WorkingParameters from './WorkingParameters.jsx';

import socketManager from "../../socket/socketManager"
import Model2D from "../../laser/Model2D";
import {uploadImage} from '../../api/index.js';
import config_text from "../../laser/settings/config_text.json";
import {generateSvg} from "./svgUtils.js";

//Jimp支持的文件格式  https://github.com/oliver-moran/jimp
const getAccept = (fileType) => {
    let accept = '';
    switch (fileType) {
        case "bw":
        case "greyscale":
            //TODO: .tiff读取报错
            // Error: read ECONNRESET
            //       at TCP.onStreamRead (internal/stream_base_commons.js:205:27)
            // accept = '.bmp, .gif, .jpeg, .jpg, .png, .tiff';
            accept = '.bmp, .gif, .jpeg, .jpg, .png';
            break;
        case "svg":
        case "text":
            accept = '.svg';
            break;
    }
    return accept;
};

class Index extends React.Component {
    fileInput = React.createRef();
    state = {
        fileType: '', // bw, greyscale, vector
        accept: '',
        fileTypeSelected: "null"
    };

    componentDidMount() {
        laserManager.on("onChange", (model2d) => {
            let obj = model2d ? _.cloneDeep(model2d.settings.transformation) : null;
            // console.log(JSON.stringify(obj, null, 2))

            let fileTypeSelected = "null"
            if (model2d) {
                fileTypeSelected = model2d.fileType;
            }
            this.setState({
                fileTypeSelected
            })
        });
    }

    actions = {
        onChangeFile: async (event) => {
            //bw, greyscale, svg
            const file = event.target.files[0];
            const fileType = this.state.fileType;
            const response = await uploadImage(file);
            const {url, width, height} = response;
            console.log("response: " + JSON.stringify(response))

            const model2D = new Model2D(fileType);
            model2D.setImage(url, width, height);

            laserManager.addModel2D(model2D);
        },
        onClickToUpload: async (fileType) => {
            if (fileType === "text") {
                const config = _.cloneDeep(config_text);
                const svg = await generateSvg(config.config_text);

                const filename = "test.svg";
                const blob = new Blob([svg], {type: 'text/plain'});
                const file = new File([blob], filename);

                const response = await uploadImage(file);

                const {url, width, height} = response;
                console.log("response: " + JSON.stringify(response))

                const model2D = new Model2D(fileType);
                model2D.setImage(url, width, height);

                //增加数据config_text
                model2D.userData = {config_text: config.config_text};
                laserManager.addModel2D(model2D);
                return;
            }

            this.setState({
                fileType,
                accept: getAccept(fileType)
            }, () => {
                this.fileInput.current.value = null;
                this.fileInput.current.click();
            });
        },
        generateGcode: () => {
            laserManager._selected.generateGcode();
        },
        exportGcode: () => {
            const gcode = laserManager._selected.gcode;
            const blob = new Blob([gcode], {type: 'text/plain;charset=utf-8'});
            const fileName = "be.gcode";
            FileSaver.saveAs(blob, fileName, true);
        },
        loadGcode: () => {
            const gcode = laserManager._selected.gcode;
            socketManager.loadGcode(gcode)
        },
        startSend: () => {
            socketManager.startSendGcode()
        },
        stopSend: () => {
            socketManager.stopSendGcode()
        },
    };

    render() {
        const {accept} = this.state;
        const {fileTypeSelected} = this.state;
        const actions = this.actions;
        return (
            <div style={{
                width: "100%",
                height: "100%"
            }}>
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: "240px"
                }}>
                    <CoordinateSystem2D/>
                </div>
                <div style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: "240px"
                }}>
                    <h2>{fileTypeSelected}</h2>
                    <input
                        ref={this.fileInput}
                        type="file"
                        accept={accept}
                        style={{display: 'none'}}
                        multiple={false}
                        onChange={actions.onChangeFile}
                    />
                    <Button
                        type="primary"
                        onClick={() => actions.onClickToUpload('bw')}
                    >
                        {"bw"}
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => actions.onClickToUpload('greyscale')}
                    >
                        {"greyscale"}
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => actions.onClickToUpload('svg')}
                    >
                        {"svg"}
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => actions.onClickToUpload('text')}
                    >
                        {"text"}
                    </Button>
                    <br/><br/>
                    <Button
                        type="primary"
                        onClick={actions.generateGcode}
                    >
                        {"generateGcode"}
                    </Button>
                    <Button
                        type="primary"
                        onClick={actions.exportGcode}
                    >
                        {"export gcode"}
                    </Button>

                    <Button
                        type="primary"
                        onClick={actions.loadGcode}
                    >
                        {"load gcode"}
                    </Button>

                    <Button
                        type="primary"
                        onClick={actions.startSend}
                    >
                        {"start Send"}
                    </Button>

                    <Button
                        type="primary"
                        onClick={actions.stopSend}
                    >
                        {"stop Send"}
                    </Button>

                    <Transformation/>
                    <ConfigGreyscale/>
                    <ConfigBW/>
                    <ConfigSvg/>
                    <ConfigText/>
                    <WorkingParameters/>
                </div>
            </div>
        )
    }
}

export default Index;
