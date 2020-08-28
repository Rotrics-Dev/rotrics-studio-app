import React from 'react';
import {Tabs} from 'antd';
import messageI18n from "../../utils/messageI18n";
import FileSaver from 'file-saver';
import ToolBarI18n from '../ToolBarI18n/Index.jsx'
import Upload from "./ui/Upload/Index.jsx";
import Transformation from "./ui/Transformation/Index.jsx";
import Canvas3D from "./ui/Canvas3D/Index.jsx";
import Progress from "./ui/Progress/Index.jsx";
import Info from "./ui/Info/Index.jsx";
import GcodePreviewControl from "./ui/GcodePreviewControl/Index.jsx";
import Config from "./ui/Config/Index.jsx";
import Control from "./ui/Control/Index.jsx";
import {actions as p3dModelActions, exportModelsToBlob} from "../../reducers/p3dModel";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import styles from './styles.css';
import layout_styles from '../layout_styles.css';

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
            if (this.props.modelCount === 0) {
                messageI18n.warning('Load model first', 1);
                return;
            }
            const blob = exportModelsToBlob();
            const date = new Date();
            const arr = [date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
            const fileName = arr.join("") + ".stl";
            FileSaver.saveAs(blob, fileName, true);
            messageI18n.success('Export model success', 1);
        }
    };

    render() {
        const {model, modelCount} = this.props;
        const {t} = this.props;
        const operations = this.operations;
        const enabledInfo = {
            exportModels: (modelCount > 0),
            layFlat: !!model,
            duplicate: !!model,
            del: !!model,
            clear: (modelCount > 0)
        };
        const visibleInfo = {
            exportModels: true,
            undo: false,
            redo: false,
            layFlat: true,
            duplicate: true,
            del: true,
            clear: true
        };
        const actions = this.actions;
        return (
            <div>
                <div className={layout_styles.div_canvas}>
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
                <div className={layout_styles.div_tool_bar}>
                    <ToolBarI18n operations={operations} enabledInfo={enabledInfo} visibleInfo={visibleInfo}/>
                </div>
                <div className={layout_styles.div_right_panel}>
                    <Tabs centered={true} size="small">
                        <TabPane tab={t('Control')} key="1">
                            <Control/>
                        </TabPane>
                        <TabPane tab={t('G-code')} key="2">
                            <Config/>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));
