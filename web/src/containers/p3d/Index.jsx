import React from 'react';
import {Tabs, message, Button} from 'antd';
import "antd/dist/antd.css";
import FileSaver from 'file-saver';
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
import {actions as p3dModelActions, exportModelsToBlob} from "../../reducers/p3dModel";
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
        },
        exportModels: () => {
            console.log("exportModels")
            if (this.props.modelCount === 0) {
                message.warning('Load model first', 1);
                return;
            }
            const blob = exportModelsToBlob();
            const date = new Date();
            const arr = [date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
            const fileName = arr.join("") + ".stl";
            FileSaver.saveAs(blob, fileName, true);
            message.success('Export model success', 1);
        }
    };

    render() {
        const {model, modelCount} = this.props;
        const operations = this.operations;
        const enabledInfo = {exportModels: (modelCount > 0), layFlat: !!model, duplicate: !!model, del: !!model, clear: (modelCount > 0)};
        const visibleInfo = {exportModels: true, undo: false, redo: false, layFlat: true, duplicate: true, del: true, clear: true};
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
                    right: "351px",
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
                    right: "351px",
                    bottom: "-3px",
                    height: "38px",
                }}>
                    <Progress/>
                </div>
                <div style={{
                    position: "absolute",
                    bottom: "15px",
                    right: "351px",
                    height: "45px",
                    width: "100px",
                }}>
                    <Info/>
                </div>
                <div style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    right: "315px",
                    width: "36px"
                }}>
                    <ToolBar operations={operations} enabledInfo={enabledInfo} visibleInfo={visibleInfo}/>
                </div>
                <div style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: "315px",
                    backgroundColor: "#F2F2F2",
                    overflowY: "scroll"
                }}>
                    <Tabs type="card" centered={true} size="small" tabBarGutter={0}
                          tabBarStyle={{height: "30px", width: "100%", marginBottom: "8px"}}>
                        <TabPane tab={
                            <div style={{textAlign: "center", fontSize: "15px", width: "107px", height: "100%"}}>
                                G-code
                            </div>
                        } key="1">
                            <Config/>
                        </TabPane>
                        <TabPane tab={
                            <div style={{textAlign: "center", fontSize: "15px", width: "107px", height: "100%"}}>
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
    const {model, modelCount, result} = state.p3dModel;
    return {
        result,
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
