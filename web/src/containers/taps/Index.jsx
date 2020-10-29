import React from 'react';
import {connect} from 'react-redux';
import styles from './styles.css';
import ReactGA from 'react-ga';
import Header from '../header/Index.jsx';
import Basic from '../basic/Index.jsx'
import WriteAndDraw from '../writeAndDraw/Index.jsx'
import Laser from '../laser/Index.jsx';
import P3D from '../p3d/Index.jsx';
import Code from '../code/Index.jsx';
import Debug from '../debug/Index.jsx';
import Settings from '../settings/Index.jsx';
import {actions as hotKeysActions} from "../../reducers/hotKeys";
import {actions as serialPortActions} from "../../reducers/serialPort";
import {actions as codeActions} from "../../reducers/code";
import {actions as codeProjectActions} from "../../reducers/codeProject";
import {actions as socketActions} from "../../reducers/socket";
import {actions as gcodeSendActions} from "../../reducers/gcodeSend";
import {actions as tapsActions} from "../../reducers/taps"
import {actions as p3dPrintSettingsActions} from "../../reducers/p3dPrintSettings";
import {actions as p3dMaterialSettingsActions} from "../../reducers/p3dMaterialSettings";
import {actions as settingsGeneralActions} from "../../reducers/settingsGeneral";
import {actions as fontsActions} from "../../reducers/fonts";
import notificationI18n from "../../utils/notificationI18n";
import {getUuid} from '../../utils/index.js';
import {TAP_BASIC, TAP_LASER, TAP_P3D, TAB_WRITE_AND_DRAW, TAP_CODE, TAP_SETTINGS, TAP_DEBUG} from "../../constants.js";

const GA_TRACKING_ID = 'UA-128953016-5';

ReactGA.initialize(GA_TRACKING_ID, {
    debug: false,
    titleCase: false,
    gaOptions: {
        userId: 123,
        siteSpeedSampleRate: 100
    }
});

const notificationKey = getUuid();

class Index extends React.Component {
    constructor(props) {
        super(props);
        this.props.init();
    }

    actions = {
        changeTap: (tap) => {
            ReactGA.event({
                category: 'open tap',
                action: tap
            });
            this.props.changeTap(tap);
        }
    };

    componentDidMount() {
        // disabled select text on document
        document.onselectstart = () => {
            return false;
        };

        setInterval(() => {
            if (this.props.status === "disconnect") {
                notificationI18n.error({
                    key: notificationKey,
                    message: 'Internal error occurred',
                    description: 'Please restart the app',
                    duration: 0
                });
            } else if (this.props.status === "connect") {
                notificationI18n.close(notificationKey);
            }
        }, 3000)
    }

    render() {
        const {changeTap} = this.actions;
        const {tap} = this.props;
        return (
            <div>
                <div className={styles.div_header}>
                    <Header/>
                </div>
                <div className={styles.div_tap_bar}>
                    <button
                        onClick={() => changeTap(TAP_BASIC)}
                        className={tap === TAP_BASIC ? styles.btn_basic_selected : styles.btn_basic}
                    />
                    <button
                        onClick={() => changeTap(TAB_WRITE_AND_DRAW)}
                        className={tap === TAB_WRITE_AND_DRAW ? styles.btn_write_draw_selected : styles.btn_write_draw}
                    />
                    <button
                        onClick={() => changeTap(TAP_LASER)}
                        className={tap === TAP_LASER ? styles.btn_laser_selected : styles.btn_laser}
                    />
                    <button
                        onClick={() => changeTap(TAP_P3D)}
                        className={tap === TAP_P3D ? styles.btn_3d_selected : styles.btn_3d}
                    />
                    <button
                        onClick={() => changeTap(TAP_CODE)}
                        className={tap === TAP_CODE ? styles.btn_code_selected : styles.btn_code}
                    />
                    <button
                        onClick={() => changeTap(TAP_DEBUG)}
                        className={tap === TAP_DEBUG ? styles.btn_debug_selected : styles.btn_debug}
                    />
                    <button
                        onClick={() => changeTap(TAP_SETTINGS)}
                        className={tap === TAP_SETTINGS ? styles.btn_settings_selected : styles.btn_settings}
                    />
                </div>
                <div className={styles.div_workspace}>
                    <div className={tap === TAP_BASIC ? styles.div_tap_show : styles.div_tap_hidden}>
                        <Basic/>
                    </div>
                    <div className={tap === TAP_LASER ? styles.div_tap_show : styles.div_tap_hidden}>
                        <Laser/>
                    </div>
                    <div className={tap === TAP_P3D ? styles.div_tap_show : styles.div_tap_hidden}>
                        <P3D/>
                    </div>
                    <div
                        className={tap === TAB_WRITE_AND_DRAW ? styles.div_tap_show : styles.div_tap_hidden}>
                        <WriteAndDraw/>
                    </div>
                    <div className={tap === TAP_CODE ? styles.div_tap_show : styles.div_tap_hidden}>
                        <Code/>
                    </div>
                    <div className={tap === TAP_DEBUG ? styles.div_tap_show : styles.div_tap_hidden}>
                        <Debug/>
                    </div>
                    <div className={tap === TAP_SETTINGS ? styles.div_tap_show : styles.div_tap_hidden}>
                        <Settings/>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {tap} = state.taps;
    const {status} = state.socket;
    return {
        tap,
        status
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        changeTap: (value) => dispatch(tapsActions.changeTap(value)),
        init: () => {
            dispatch(socketActions.init()); // must execute first
            dispatch(gcodeSendActions.init());
            dispatch(hotKeysActions.init());
            dispatch(serialPortActions.init());
            dispatch(codeActions.init());
            dispatch(codeProjectActions.init());
            dispatch(settingsGeneralActions.init());
            dispatch(p3dMaterialSettingsActions.init());
            dispatch(p3dPrintSettingsActions.init());
            dispatch(fontsActions.init());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
