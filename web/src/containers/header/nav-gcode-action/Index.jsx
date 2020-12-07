import React from 'react';
import FileSaver from 'file-saver';
import styles from './styles.css';
import {Space} from 'antd';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {actions as model2dActions} from "../../../reducers/model2d";
import {actions as p3dModelActions} from "../../../reducers/p3dModel";
import {TAB_WRITE_DRAW, TAP_LASER, TAP_P3D} from "../../../constants";
import messageI18n from "../../../utils/messageI18n";

class Index extends React.Component {
    getPropsByTap = (tap) => {
        let gcode = null;
        let modelCount = 0;
        let isAllPreviewed = false;
        let generateGcode = null;
        switch (tap) {
            case TAP_LASER:
                gcode = this.props.gcodeLaser;
                modelCount = this.props.modelCountLaser;
                isAllPreviewed = this.props.isAllPreviewedLaser;
                generateGcode = this.props.generateGcodeLaser;
                break;
            case TAP_P3D:
                gcode = this.props.gcodeP3d;
                modelCount = this.props.modelCountP3d;
                isAllPreviewed = this.props.isAllPreviewed4p3d;
                generateGcode = this.props.generateGcodeP3d;
                break;
            case TAB_WRITE_DRAW:
                gcode = this.props.gcodeWriteDraw;
                modelCount = this.props.modelCountWriteDraw;
                isAllPreviewed = this.props.isAllPreviewedWriteDraw;
                generateGcode = this.props.generateGcodeWriteDraw;
                break;
        }
        return {gcode, modelCount, isAllPreviewed, generateGcode};
    };

    actions = {
        generateGcode: () => {
            const {generateGcode} = this.getPropsByTap(this.props.tap);
            generateGcode();
        },
        exportGcode: () => {
            const {tap} = this.props;
            const {gcode} = this.getPropsByTap(tap);
            const d = new Date();
            const filename = [d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()].join('') + ".gcode";
            switch (tap) {
                case TAP_LASER:
                case TAB_WRITE_DRAW: {
                    const blob = new Blob([gcode], {type: 'text/plain;charset=utf-8'});
                    FileSaver.saveAs(blob, filename, true);
                    messageI18n.success('Success');
                    break;
                }
                case TAP_P3D: {
                    //for p3d, gcode is gcodeUrl
                    fetch(gcode)
                        .then(resp => resp.blob())
                        .then(blob => {
                            FileSaver.saveAs(blob, filename, true);
                            messageI18n.success('Success', 1);
                        })
                        .catch(() => {
                            console.error("down load err");
                            messageI18n.error('Failed', 1);
                        });
                    break;
                }
            }
        },
    };

    render() {
        const actions = this.actions;
        const {t} = this.props;
        const {tap} = this.props;
        let generateDisabled = true;
        let exportDisabled = true;
        if ([TAB_WRITE_DRAW, TAP_LASER, TAP_P3D].includes(tap)) {
            const {gcode, modelCount, isAllPreviewed} = this.getPropsByTap(tap);
            generateDisabled = (modelCount === 0 || !isAllPreviewed);
            exportDisabled = (!gcode);
        }
        return (
            <Space size={0}>
                <button className={styles.btn_generate} onClick={actions.generateGcode} disabled={generateDisabled}>
                    {t("Generate G-code")}
                </button>
                <button className={styles.btn_export} onClick={actions.exportGcode} disabled={exportDisabled}>
                    {t("Export G-code")}
                </button>
            </Space>
        )
    }
}

const mapStateToProps = (state) => {
    const {tap} = state.taps;
    const {gcodeLaser, modelCountLaser, isAllPreviewedLaser, gcodeWriteDraw, modelCountWriteDraw, isAllPreviewedWriteDraw} = state.model2d;
    const {gcodeUrl: gcodeP3d, modelCount: modelCountP3d} = state.p3dModel;
    return {
        tap,
        gcodeWriteDraw,
        modelCountWriteDraw,
        isAllPreviewedWriteDraw,
        gcodeLaser,
        modelCountLaser,
        isAllPreviewedLaser,
        gcodeP3d,
        modelCountP3d,
        isAllPreviewed4p3d: true,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        generateGcodeLaser: () => dispatch(model2dActions.generateGcode('laser')),
        generateGcodeWriteDraw: () => dispatch(model2dActions.generateGcode('write_draw')),
        generateGcodeP3d: () => dispatch(p3dModelActions.generateGcode())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));
