import React from 'react';
import styles from './styles.css';
import {Button, Slider, Space, Divider} from 'antd';
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import {toFixed} from "../../../../../shared/lib/numeric-utils";
import {uploadFile} from "../../../../api";
import {actions as p3dActions} from "../../../../reducers/p3d";
import {connect} from 'react-redux';

class Index extends React.Component {
    fileInput = React.createRef();
    state = {
        activatedTap: "", //激活的tap: move/scale/rotate
    };

    actions = {
        uploadFile: async (event) => {
            const file = event.target.files[0];
            const response = await uploadFile(file);
            const {url} = response;
            this.props.loadModel(url)
        },
        onClickUpload: () => {
            this.fileInput.current.value = null;
            this.fileInput.current.click();
        },
        activateTap: (tap) => {
            this.setState({activatedTap: tap})
        },
        //
        setX: (value) => {
            console.log("x: " + value)
        },
        setY: (value) => {
        },
        setRotateX: (value) => {
        },
        setRotateY: (value) => {
        },
        setRotateZ: (value) => {
        },
    };

    render() {
        const state = this.state;
        const actions = this.actions;
        const {activatedTap} = state;
        return (
            <div style={{width: "100%", height: "100%"}}>
                <input
                    ref={this.fileInput}
                    type="file"
                    accept={'.stl'}
                    style={{display: 'none'}}
                    multiple={false}
                    onChange={actions.uploadFile}
                />
                <Space direction={"vertical"} style={{marginBottom: "10px"}}>
                    <Button
                        block
                        onClick={actions.onClickUpload}
                    >
                        {"upload"}
                    </Button>
                    <Button
                        block
                        onClick={() => actions.activateTap('move')}
                    >
                        {"move"}
                    </Button>
                    <Button
                        block
                        onClick={() => actions.activateTap('scale')}
                    >
                        {"scale"}
                    </Button>
                    <Button
                        block
                        onClick={() => actions.activateTap('rotate')}
                    >
                        {"rotate"}
                    </Button>
                </Space>
                {activatedTap === "move" &&
                <div style={{width: "150px", height: "70px", backgroundColor: "#e0e0e0"}}>
                    <Space direction={"horizontal"} style={{marginLeft: "5px"}}>
                        <h4>X</h4>
                        <Slider
                            style={{width: "100px"}}
                            min={-100}
                            max={100}
                            step={1}
                            onChange={actions.setX}
                            defaultValue={10}
                        />
                    </Space>
                    <Space direction={"horizontal"} style={{marginLeft: "5px"}}>
                        <h4>Y</h4>
                        <Slider
                            style={{width: "100px"}}
                            min={-100}
                            max={100}
                            step={1}
                            onChange={actions.setX}
                            defaultValue={10}
                        />
                    </Space>
                </div>
                }
                {activatedTap === "scale" &&
                <div style={{width: "165px", height: "35px", backgroundColor: "#e0e0e0"}}>
                    <Space direction={"horizontal"} style={{marginLeft: "5px"}}>
                        <h4>Scale</h4>
                        <Slider
                            style={{width: "100px"}}
                            min={-100}
                            max={100}
                            step={1}
                            onChange={actions.setX}
                            defaultValue={10}
                        />
                    </Space>
                </div>
                }
                {activatedTap === "rotate" &&
                <div style={{width: "150px", height: "105px", backgroundColor: "#e0e0e0"}}>
                    <Space direction={"horizontal"} style={{marginLeft: "5px"}}>
                        <h4>RX</h4>
                        <Slider
                            style={{width: "100px"}}
                            min={-100}
                            max={100}
                            step={1}
                            onChange={actions.setX}
                            defaultValue={10}
                        />
                    </Space>
                    <Space direction={"horizontal"} style={{marginLeft: "5px"}}>
                        <h4>RY</h4>
                        <Slider
                            style={{width: "100px"}}
                            min={-100}
                            max={100}
                            step={1}
                            onChange={actions.setX}
                            defaultValue={10}
                        />
                    </Space>
                    <Space direction={"horizontal"} style={{marginLeft: "5px"}}>
                        <h4>RZ</h4>
                        <Slider
                            style={{width: "100px"}}
                            min={-100}
                            max={100}
                            step={1}
                            onChange={actions.setX}
                            defaultValue={10}
                        />
                    </Space>
                </div>
                }
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        loadModel: (url) => dispatch(p3dActions.loadModel(url)),
    };
};

export default connect(null, mapDispatchToProps)(Index);

