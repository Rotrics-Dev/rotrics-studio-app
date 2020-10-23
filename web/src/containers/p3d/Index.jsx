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
import ControlPanel from "./ui/ControlPanel/Index.jsx";
import {actions as p3dModelActions, exportModelsToBlob} from "../../reducers/p3dModel";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import styles from './styles.css';
import layout_styles from '../layout_styles.css';

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
            const blob = exportModelsToBlob(this.props.rendererParent4model);
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
                <div className={styles.div_progress}>
                    <Progress/>
                </div>
                <div className={styles.div_info}>
                    <Info/>
                </div>
                <div className={layout_styles.div_tool_bar}>
                    <ToolBarI18n operations={operations} enabledInfo={enabledInfo} visibleInfo={visibleInfo}/>
                </div>
                <div className={layout_styles.div_right_panel}>
                    <ControlPanel/>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {rendererParent4model, model, modelCount, result} = state.p3dModel;
    return {
        rendererParent4model,
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
