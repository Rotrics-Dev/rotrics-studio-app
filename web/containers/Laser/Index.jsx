import React from 'react';
import _ from 'lodash';
import styles from './styles.css';
import CoordinateSystem2D from '../../components/CoordinateSystem2D/Index.jsx'
import laserManager from "../../manager/laserManager.js";
import {Button} from 'antd';
import "antd/dist/antd.css";
import Transformation from './Transformation.jsx';
import ConfigBW from './ConfigBW.jsx';
import WorkingParameters from './WorkingParameters.jsx';

const getAccept = (mode) => {
    let accept = '';
    if (['bw', 'greyscale'].includes(mode)) {
        accept = '.png, .jpg, .jpeg, .bmp';
    } else if (['vector'].includes(mode)) {
        accept = '.svg, .png, .jpg, .jpeg, .bmp';
    }
    return accept;
};

class Index extends React.Component {
    fileInput = React.createRef();
    state = {
        fileType: '', // bw, greyscale, vector
        accept: '',
    };

    actions = {
        onChangeFile: async (event) => {
            const file = event.target.files[0];
            const fileType = this.state.fileType;
            await laserManager.loadModel(fileType, file);
        },
        onClickToUpload: (mode) => {
            this.setState({
                fileType: mode,
                accept: getAccept(mode)
            }, () => {
                this.fileInput.current.value = null;
                this.fileInput.current.click();
            });
        },
        onClickInsertText: () => {
            console.log("text")
        },
        changeSettings: (e) => {
            console.log("text")
        },


    };

    render() {
        const {accept} = this.state;
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
                        {"B&W"}
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => actions.onClickToUpload('greyscale')}
                    >
                        {"greyscale"}
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => actions.onClickToUpload('vector')}
                    >
                        {"vector"}
                    </Button>
                    <Button
                        type="primary"
                        onClick={actions.onClickInsertText}
                    >
                        {"text"}
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => laserManager.previewSelected()}
                    >
                        {"preview"}
                    </Button>
                    <Transformation/>
                    <ConfigBW/>
                    <WorkingParameters/>
                </div>
            </div>
        )
    }
}

export default Index;
