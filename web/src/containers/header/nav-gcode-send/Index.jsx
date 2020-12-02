import React from 'react';
import styles from './styles.css';
import {Space, Progress} from 'antd';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {actions as gcodeSendActions} from "../../../reducers/gcodeSend";
import {TAB_WRITE_AND_DRAW, TAP_LASER, TAP_P3D} from "../../../constants";
import getGcode4runBoundary from "../../../utils/getGcode4runBoundary";
import Tooltip from '../../Tooltip/Index.jsx';

class Index extends React.Component {
    getPropsByTap = (tap) => {
        let modelParent = null;
        let gcode = null;
        switch (tap) {
            case TAP_LASER:
                modelParent = this.props.modelParentLaser;
                gcode = this.props.gcodeLaser;
                break;
            case TAB_WRITE_AND_DRAW:
                modelParent = this.props.modelParentWriteDraw;
                gcode = this.props.gcodeWriteDraw;
                break;
        }
        return {gcode, modelParent};
    };

    actions = {
        startOrPauseTask: () => {
            const {tap, curStatus, startTask, pauseTask, resumeTask} = this.props;
            const {gcode} = this.getPropsByTap(tap);
            switch (curStatus) {
                case "idle":
                    startTask(gcode, tap);
                    break;
                case "started":
                    pauseTask();
                    break;
                case "paused":
                    resumeTask();
                    break;
            }
        },
        stopTask: () => {
            this.props.stopTask();
        },
        runBoundary: () => {
            const {modelParent} = this.getPropsByTap(this.props.tap);
            this.props.send(getGcode4runBoundary(modelParent.children));
        }
    };

    render() {
        const actions = this.actions;
        const {t} = this.props;
        const {tap, path, curStatus, total, sent, task} = this.props;
        const {gcode} = this.getPropsByTap(tap);
        const startOrPauseDisabled = (!path || !gcode || !["idle", "started", "paused"].includes(curStatus));
        const stopDisabled = (!path || !["started", "paused"].includes(curStatus));
        const runBoundaryDisabled = (!path || !gcode || !["idle"].includes(curStatus) || tap === TAP_P3D);
        let percent = 100;
        if (task && total > 0) {
            percent = Math.floor(sent / total * 100);
        }
        return (
            <Space size={0}>
                <Tooltip placement="bottom"
                         title={curStatus === "started" ? t("Pause Send G-code") : t("Start Send G-code")}>
                    <button
                        disabled={startOrPauseDisabled}
                        onClick={actions.startOrPauseTask}
                        className={startOrPauseDisabled ? styles.btn_play_disabled : (curStatus === "started" ? styles.btn_pause : styles.btn_play)}
                    />
                </Tooltip>
                <Tooltip placement="bottom" title={t("Stop Send G-code")}>
                    <button
                        disabled={stopDisabled}
                        onClick={actions.stopTask}
                        className={stopDisabled ? styles.btn_stop_disabled : styles.btn_stop}
                    />
                </Tooltip>
                <Tooltip placement="bottom" title={t("Run Boundary")}>
                    <button
                        disabled={runBoundaryDisabled}
                        onClick={actions.runBoundary}
                        className={runBoundaryDisabled ? styles.btn_run_boundary_disabled : styles.btn_run_boundary}
                    />
                </Tooltip>
                <Tooltip placement="bottom" title={t("G-code Send Progress")}>
                    <Progress style={{marginRight: "5px"}} type="circle" percent={percent} width={25}/>
                </Tooltip>
            </Space>
        )
    }
}

const mapStateToProps = (state) => {
    const {tap} = state.taps;
    const {path} = state.serialPort;
    const {curStatus, total, sent, task} = state.gcodeSend;
    const { modelParentWriteDraw, gcodeWriteDraw} = state.model2d;
    const {modelParentLaser, gcodeLaser} = state.model2d;
    // const { gcodeUrl: gcode4p3d} = state.p3dModel;
    return {
        tap,
        path,
        curStatus,
        total,
        sent,
        task,
        gcodeWriteDraw,
        gcodeLaser,
        modelParentWriteDraw,
        modelParentLaser
        // gcode4p3d,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        send: (gcode) => dispatch(gcodeSendActions.send(gcode)),
        startTask: (gcode, tap) => dispatch(gcodeSendActions.startTask(gcode, tap)),
        stopTask: () => dispatch(gcodeSendActions.stopTask()),
        pauseTask: () => dispatch(gcodeSendActions.pauseTask()),
        resumeTask: () => dispatch(gcodeSendActions.resumeTask()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));

