import React from 'react';
import _ from 'lodash';
import FileSaver from 'file-saver';

import styles from './styles.css';
import laserManager from "../../../laser/laserManager.js";
import {Button, Input, Space, Divider} from 'antd';

import "antd/dist/antd.css";

import Transformation from './Transformation.jsx';

import ConfigGreyscale from './ConfigGreyscale.jsx';
import ConfigBW from './ConfigBW.jsx';
import ConfigSvg from './ConfigSvg.jsx';
import ConfigText from './ConfigText.jsx';

import WorkingParameters from './WorkingParameters.jsx';

import socketManager from "../../../socket/socketManager"
import Model2D from "../../../laser/Model2D";
import {uploadImage} from '../../../api/index.js';
import config_text from "../../../laser/settings/config_text.json";
import {generateSvg} from "../svgUtils.js";
import Line from '../../../components/Line/Index.jsx'

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
        fileTypeSelected: ""
    };

    componentDidMount() {
        laserManager.on("onChange", (model2d) => {
            let obj = model2d ? _.cloneDeep(model2d.settings.transformation) : null;
            // console.log(JSON.stringify(obj, null, 2))

            let fileTypeSelected = ""
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
            model2D.loadImg(url, width, height);

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
                model2D.loadImg(url, width, height);

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
                <Space direction={"vertical"} style={{width: "100%", padding: "5px"}}>
                    <Button
                        block
                        onClick={actions.generateGcode}
                    >
                        {"generateGcode"}
                    </Button>
                    <Button
                        block
                        onClick={actions.exportGcode}
                    >
                        {"export gcode"}
                    </Button>
                    <Button
                        block
                        onClick={actions.loadGcode}
                    >
                        {"load gcode"}
                    </Button>
                    <Button
                        block
                        onClick={actions.startSend}
                    >
                        {"start Send"}
                    </Button>
                    <Button
                        block
                        onClick={actions.stopSend}
                    >
                        {"stop Send"}
                    </Button>
                </Space>
                <Line/>
                <h4>{"current image type: " + fileTypeSelected}</h4>
                <input
                    ref={this.fileInput}
                    type="file"
                    accept={accept}
                    style={{display: 'none'}}
                    multiple={false}
                    onChange={actions.onChangeFile}
                />
                <Space direction={"horizontal"} size={0}>
                    <button
                        className={styles.btn_bw}
                        onClick={() => actions.onClickToUpload('bw')}
                    />
                    <button
                        className={styles.btn_greyscale}
                        onClick={() => actions.onClickToUpload('greyscale')}
                    />
                    <button
                        className={styles.btn_svg}
                        onClick={() => actions.onClickToUpload('svg')}
                    />
                    <button
                        className={styles.btn_text}
                        onClick={() => actions.onClickToUpload('text')}
                    />
                </Space>
                <Transformation/>
                <ConfigGreyscale/>
                <ConfigBW/>
                <ConfigSvg/>
                <ConfigText/>
                <WorkingParameters/>
            </div>
        )
    }
}

export default Index;
