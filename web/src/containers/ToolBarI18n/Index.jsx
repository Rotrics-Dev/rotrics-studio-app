import React, {PureComponent} from 'react';
import Tooltip from '../Tooltip/Index.jsx';
import FileSaver from 'file-saver';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {Space, Modal} from 'antd';
import styles from './styles.css';
import {TAP_LASER, TAP_P3D, TAB_WRITE_DRAW} from "../../constants.js";
import {actions as model2dActions} from "../../reducers/model2d";
import {actions as p3dModelActions, exportModelsToBlob} from "../../reducers/p3dModel";
import messageI18n from "../../utils/messageI18n";

class Index extends PureComponent {
    getPropsByTap = (tap) => {
        let model = null;
        let modelCount = 0;
        let removeSelected = null;
        let removeAll = null;
        let duplicateSelected = null;
        let undo = null;
        let redo = null;
        switch (tap) {
            case TAP_LASER:
                model = this.props.modelLaser;
                modelCount = this.props.modelCountLaser;
                removeSelected = this.props.removeSelectedLaser;
                removeAll = this.props.removeAllLaser;
                duplicateSelected = this.props.duplicateSelectedLaser;
                undo = this.props.undoLaser;
                redo = this.props.redoLaser;
                break;
            case TAB_WRITE_DRAW:
                model = this.props.modelWriteDraw;
                modelCount = this.props.modelCountWriteDraw;
                removeSelected = this.props.removeSelectedWriteDraw;
                removeAll = this.props.removeAllWriteDraw;
                duplicateSelected = this.props.duplicateSelectedWriteDraw;
                undo = this.props.undoWriteDraw;
                redo = this.props.redoWriteDraw;
                break;
            case TAP_P3D:
                model = this.props.model4p3d;
                modelCount = this.props.modelCount4p3d;
                removeSelected = this.props.removeSelectedP3d;
                removeAll = this.props.removeAllP3d;
                duplicateSelected = this.props.duplicateSelectedP3d;
                undo = this.props.undoP3d;
                redo = this.props.redoP3d;
                break;
        }
        return {model, modelCount, removeSelected, removeAll, duplicateSelected, undo, redo};
    };

    actions = {
        exportModels4p3d: () => {
            const blob = exportModelsToBlob(this.props.rendererParent4model4p3d);
            const d = new Date();
            const filename = [d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()].join("") + ".stl";
            FileSaver.saveAs(blob, filename, true);
            messageI18n.success('Success', 1);
        },
        showClearConfirmDialog: () => {
            const {t, tap} = this.props;
            Modal.confirm({
                title: t('Are you sure to delete all?'),
                centered: true,
                okText: t('Delete'),
                okType: 'danger',
                cancelText: t('Cancel'),
                onOk: () => {
                    const {removeAll} = this.getPropsByTap(tap);
                    removeAll();
                }
            })
        }
    };

    render() {
        const actions = this.actions;
        const {t, tap, layFlatP3d} = this.props;
        const {model, modelCount, removeSelected, duplicateSelected, undo, redo} = this.getPropsByTap(tap);
        return (
            <div className={styles.div_root}>
                <Space direction={"vertical"} size={5} style={{paddingTop: "5px"}}>
                    {tap === TAP_P3D &&
                    <Tooltip title={t('duplicate')}>
                        <button
                            disabled={!model}
                            onClick={duplicateSelected}
                            className={!model ? styles.btn_duplicate_disabled : styles.btn_duplicate}
                        />
                    </Tooltip>
                    }
                    <Tooltip title={t('delete')}>
                        <button
                            disabled={!model}
                            onClick={removeSelected}
                            className={!model ? styles.btn_delete_disabled : styles.btn_delete}
                        />
                    </Tooltip>
                    <Tooltip title={t('clear')}>
                        <button
                            disabled={modelCount === 0}
                            onClick={actions.showClearConfirmDialog}
                            className={modelCount === 0 ? styles.btn_clear_disabled : styles.btn_clear}
                        />
                    </Tooltip>
                    {tap === TAP_P3D &&
                    <Tooltip title={t('lay flat')}>
                        <button
                            disabled={!model}
                            onClick={layFlatP3d}
                            className={!model ? styles.btn_lay_flat_disabled : styles.btn_lay_flat}
                        />
                    </Tooltip>
                    }
                    {tap === TAP_P3D &&
                    <Tooltip title={t('export models')}>
                        <button
                            disabled={modelCount === 0}
                            onClick={actions.exportModels4p3d}
                            className={modelCount === 0 ? styles.btn_export_disabled : styles.btn_export}
                        />
                    </Tooltip>
                    }
                </Space>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const {tap} = state.taps;
    const {modelLaser,  modelCountLaser, modelWriteDraw, modelCountWriteDraw} = state.model2d;
    const {model: model4p3d, modelCount: modelCount4p3d} = state.p3dModel;
    const {rendererParent4model: rendererParent4model4p3d} = state.p3dModel;
    return {
        tap,
        modelLaser,
        modelCountLaser,
        model4p3d,
        modelCount4p3d,
        modelWriteDraw,
        modelCountWriteDraw,
        rendererParent4model4p3d
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        removeSelectedLaser: () => dispatch(model2dActions.removeSelected('laser')),
        removeAllLaser: () => dispatch(model2dActions.removeAll('laser')),
        duplicateSelectedLaser: () => dispatch(model2dActions.duplicateSelected('laser')),
        undoLaser: () => dispatch(model2dActions.undo('laser')),
        redoLaser: () => dispatch(model2dActions.redo('laser')),

        removeSelectedWriteDraw: () => dispatch(model2dActions.removeSelected('write_draw')),
        removeAllWriteDraw: () => dispatch(model2dActions.removeAll('write_draw')),
        duplicateSelectedWriteDraw: () => dispatch(model2dActions.duplicateSelected('write_draw')),
        undoWriteDraw: () => dispatch(model2dActions.undo('write_draw')),
        redoWriteDraw: () => dispatch(model2dActions.redo('write_draw')),

        removeSelectedP3d: () => dispatch(p3dModelActions.removeSelected()),
        removeAllP3d: () => dispatch(p3dModelActions.removeAll()),
        duplicateSelectedP3d: () => dispatch(p3dModelActions.duplicateSelected()),
        undoP3d: () => dispatch(p3dModelActions.undo()),
        redoP3d: () => dispatch(p3dModelActions.redo()),
        layFlatP3d: () => dispatch(p3dModelActions.layFlat()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));

