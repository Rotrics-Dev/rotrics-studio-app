import React from 'react';
import {Tabs, Space, Button} from 'antd';
import "antd/dist/antd.css";

import ToolBar from '../../components/ToolBar/Index.jsx'

import Upload from "./ui/Upload/Index.jsx";
import Transformation from "./ui/Transformation/Index.jsx";
import Canvas3D from "./ui/Canvas3D/Index.jsx";
import Progress from "./ui/Progress/Index.jsx";
import Info from "./ui/Info/Index.jsx";
import GcodePreviewControl from "./ui/GcodePreviewControl/Index.jsx";

import Config from "./ui/Config/Index.jsx";
import Control from "./ui/Control/Index.jsx";

import styles from './styles.css';
import {actions as p3dModelActions} from "../../reducers/p3dModel";
import {connect} from 'react-redux';

const {TabPane} = Tabs;

class Index extends React.Component {
    operations = {
        undo: () => {
            this.props.undo();
        },
        redo: () => {
            this.props.redo();
        },
        layFlat: () => {
            this.props.layFlat();
        },
        duplicate: () => {
            this.props.duplicateSelected();
        },
        del: () => {
            this.props.removeSelected();
        },
        clear: () => {
            this.props.removeAll();
        }
    };

    render() {
        const {model, modelCount} = this.props;
        const operations = this.operations;
        const enabledInfo = {layFlat: !!model, duplicate: !!model, del: !!model, clear: (modelCount > 0)};
        const visibleInfo = {undo: false, redo: false, layFlat: true, duplicate: true, del: true, clear: true};
        const actions = this.actions;
        return (
            <div style={{
                width: "100%",
                height: "100%",
            }}>
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: "320px",
                    backgroundColor: "#e0e0e0"
                }}>
                    <Canvas3D/>
                </div>
                <div style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px"
                }}>
                    <Upload/>
                </div>
                <div className={styles.div_transformation}>
                    <Transformation/>
                </div>
                <div className={styles.div_gcode_preview_control}>
                    <GcodePreviewControl/>
                </div>
                <div style={{
                    position: "absolute",
                    left: 0,
                    right: "320px",
                    bottom: "-3px",
                    height: "38px",
                }}>
                    <Progress/>
                </div>
                <div style={{
                    position: "absolute",
                    bottom: "15px",
                    right: "320px",
                    height: "45px",
                    width: "100px",
                }}>
                    <Info/>
                </div>
                <div style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    right: "280px",
                    width: "40px",
                    backgroundColor: "#ff0000"
                }}>
                    <ToolBar operations={operations} enabledInfo={enabledInfo} visibleInfo={visibleInfo}/>
                </div>
                <div style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: "280px",
                    backgroundColor: "#f0f0f0",
                    overflowY: "scroll"
                }}>
                    <Tabs type="card" tabBarGutter={0} tabBarStyle={{width: "260px"}}>
                        <TabPane tab={
                            <div style={{textAlign: "center", width: "95px", height: "100%"}}>
                                G-code
                            </div>
                        } key="1">
                            <Config/>
                        </TabPane>
                        <TabPane tab={
                            <div style={{textAlign: "center", width: "95px", height: "100%"}}>
                                Control
                            </div>
                        } key="2">
                            <Control/>
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {model, modelCount} = state.p3dModel;
    return {
        model,
        modelCount
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        removeSelected: () => dispatch(p3dModelActions.removeSelected()),
        removeAll: () => dispatch(p3dModelActions.removeAll()),
        duplicateSelected: () => dispatch(p3dModelActions.duplicateSelected()),
        undo: () => dispatch(p3dModelActions.undo()),
        redo: () => dispatch(p3dModelActions.redo()),
        layFlat: () => dispatch(p3dModelActions.layFlat()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
