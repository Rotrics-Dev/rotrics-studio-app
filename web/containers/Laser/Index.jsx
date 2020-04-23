import React from 'react';
import styles from './styles.css';
import CoordinateSystem2D from '../../components/CoordinateSystem2D/Index.jsx'
import {uploadFile, uploadImage} from "../../api";
import laserManager from "../../manager/laserManager.js";
import {Button, message} from 'antd';
import "antd/dist/antd.css";
import {connect} from 'react-redux';
import {actions} from '../../reducers/laser';
import Transformation from './Transformation';

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
        accept: ''
    };

    actions = {
        onChangeFile: async (event) => {
            const file = event.target.files[0];
            const fileType = this.state.fileType;
            laserManager.loadModel(fileType, file);
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
            // this.props.insertDefaultTextVector();
        }
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
                    <Transformation/>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {model2d, width, height, x, y} = state.laser;
    return {
        model2d, width, height, x, y
    };
};
//
// const mapDispatchToProps = (dispatch) => {
//     return {
//         uploadImage: (file, fileType) => dispatch(actions.uploadImage(file, fileType)),
//         insertDefaultTextVector: () => dispatch(actions.insertDefaultTextVector('laser')),
//         updateSelectedModelTransformation: (params) => dispatch(actions.updateSelectedModelTransformation('laser', params)),
//         updateSelectedModelGcodeConfig: (params) => dispatch(actions.updateSelectedModelGcodeConfig('laser', params)),
//         updateSelectedModelPrintOrder: (printOrder) => dispatch(actions.updateSelectedModelPrintOrder('laser', printOrder))
//     };
// };

export default connect(mapStateToProps)(Index);
