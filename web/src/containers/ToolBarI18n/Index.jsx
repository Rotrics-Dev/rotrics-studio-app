import React, {PureComponent} from 'react';
import Tooltip from '../Tooltip/Index.jsx';
import FileSaver from 'file-saver';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {Space, Modal} from 'antd';
import styles from './styles.css';
import {TAP_LASER, TAP_P3D, TAB_WRITE_AND_DRAW} from "../../constants.js";
import {actions as laserActions} from "../../reducers/laser";
import {actions as p3dModelActions, exportModelsToBlob} from "../../reducers/p3dModel";
import {actions as writeAndDrawActions} from "../../reducers/writeAndDraw";
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
                model = this.props.model4laser;
                modelCount = this.props.modelCount4laser;
                removeSelected = this.props.removeSelected4laser;
                removeAll = this.props.removeAll4laser;
                duplicateSelected = this.props.duplicateSelected4laser;
                undo = this.props.undo4laser;
                redo = this.props.redo4laser;
                break;
            case TAB_WRITE_AND_DRAW:
                model = this.props.model4writeAndDraw;
                modelCount = this.props.modelCount4writeAndDraw;
                removeSelected = this.props.removeSelected4writeAndDraw;
                removeAll = this.props.removeAll4writeAndDraw;
                duplicateSelected = this.props.duplicateSelected4writeAndDraw;
                undo = this.props.undo4writeAndDraw;
                redo = this.props.redo4writeAndDraw;
                break;
            case TAP_P3D:
                model = this.props.model4p3d;
                modelCount = this.props.modelCount4p3d;
                removeSelected = this.props.removeSelected4p3d;
                removeAll = this.props.removeAll4p3d;
                duplicateSelected = this.props.duplicateSelected4p3d;
                undo = this.props.undo4p3d;
                redo = this.props.redo4p3d;
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
            messageI18n.success('Export model success', 1);
        },
        showClearConfirmDialog: () => {
            const {t, tap} = this.props;
            Modal.confirm({
                title: t('Are you sure to delete all?'),
                centered: true,
                okText: t('delete'),
                okType: 'danger',
                cancelText: t('cancel'),
                onOk: () => {
                    const {removeAll} = this.getPropsByTap(tap);
                    removeAll();
                }
            })
        }
    };

    render() {
        const actions = this.actions;
        const {t, tap, layFlat4p3d} = this.props;
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
                            onClick={layFlat4p3d}
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
    const {model: model4laser, modelCount: modelCount4laser} = state.laser;
    const {model: model4p3d, modelCount: modelCount4p3d} = state.p3dModel;
    const {model: model4writeAndDraw, modelCount: modelCount4writeAndDraw} = state.writeAndDraw;
    const {rendererParent4model: rendererParent4model4p3d} = state.p3dModel;
    return {
        tap,
        model4laser,
        modelCount4laser,
        model4p3d,
        modelCount4p3d,
        model4writeAndDraw,
        modelCount4writeAndDraw,
        rendererParent4model4p3d
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        removeSelected4laser: () => dispatch(laserActions.removeSelected()),
        removeAll4laser: () => dispatch(laserActions.removeAll()),
        duplicateSelected4laser: () => dispatch(laserActions.duplicateSelected()),
        undo4laser: () => dispatch(laserActions.undo()),
        redo4laser: () => dispatch(laserActions.redo()),

        removeSelected4writeAndDraw: () => dispatch(writeAndDrawActions.removeSelected()),
        removeAll4writeAndDraw: () => dispatch(writeAndDrawActions.removeAll()),
        duplicateSelected4writeAndDraw: () => dispatch(writeAndDrawActions.duplicateSelected()),
        undo4writeAndDraw: () => dispatch(writeAndDrawActions.undo()),
        redo4writeAndDraw: () => dispatch(writeAndDrawActions.redo()),

        removeSelected4p3d: () => dispatch(p3dModelActions.removeSelected()),
        removeAll4p3d: () => dispatch(p3dModelActions.removeAll()),
        duplicateSelected4p3d: () => dispatch(p3dModelActions.duplicateSelected()),
        undo4p3d: () => dispatch(p3dModelActions.undo()),
        redo4p3d: () => dispatch(p3dModelActions.redo()),
        layFlat4p3d: () => dispatch(p3dModelActions.layFlat()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));

