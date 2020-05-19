import React from 'react';
import ReactTooltip from "react-tooltip";
import styles from './styles.css';

import Init from './Init.jsx';
import Header from './Header/Index.jsx';

import WriteDraw from './WriteDraw/Index.jsx';
import Laser from './Laser/Index.jsx';
import P3D from './P3D/Index.jsx';
import Code from './Code/Index.jsx';
import Settings from './Settings/Index.jsx';

import DeviceControl from './Debug/DeviceControl.jsx';
import DebugHttpServer from './Debug/HttpServer.jsx';

import {TAP_WRITE_DRAW, TAP_LASER, TAP_P3D, TAP_CODE, TAP_SETTINGS} from "../constants.js";
import {actions as tapActions} from "../reducers/tap";
import {connect} from 'react-redux';

class Index extends React.Component {
    actions = {
        setTap: (value) => {
            this.props.setTap(value);
        },
    };

    render() {
        const actions = this.actions;
        const {tap} = this.props;
        return (
            <div>
                <Init/>
                <div className={styles.div_header}>
                    <Header/>
                </div>
                <div className={styles.div_tap_bar}>
                    <ReactTooltip place="right" type="info" effect="solid" backgroundColor="#c0c0c0"
                                  textColor="#292421"/>
                    <button
                        data-tip="Write/Draw"
                        onClick={() => actions.setTap(TAP_WRITE_DRAW)}
                        className={styles.btn_write_draw}
                    />
                    <button
                        data-tip="Laser"
                        onClick={() => actions.setTap(TAP_LASER)}
                        className={styles.btn_laser}
                    />
                    <button
                        data-tip="3D Print"
                        onClick={() => actions.setTap(TAP_P3D)}
                        className={styles.btn_3d}
                    />
                    <button
                        data-tip="Code"
                        onClick={() => actions.setTap(TAP_CODE)}
                        className={styles.btn_code}
                    />
                    <button
                        data-tip="Settings"
                        onClick={() => actions.setTap(TAP_SETTINGS)}
                        className={styles.btn_settings}
                    />
                </div>
                <div className={styles.div_workspace}>
                    {tap === TAP_WRITE_DRAW && <WriteDraw/>}
                    {tap === TAP_LASER && <Laser/>}
                    {tap === TAP_P3D && <P3D/>}
                    {tap === TAP_CODE && <Code/>}
                    {tap === TAP_SETTINGS && <Settings/>}

                    {tap === "DeviceControl" && <DeviceControl/>}
                    {tap === "DebugHttpServer" && <DebugHttpServer/>}
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {tap} = state.tap;
    return {
        tap
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setTap: (value) => dispatch(tapActions.setTap(value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
