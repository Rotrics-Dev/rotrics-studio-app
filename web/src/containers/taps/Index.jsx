import React from 'react';
import Tooltip from '../Tooltip/Index.jsx';
import {connect} from 'react-redux';
import styles from './styles.css';
import ReactGA from 'react-ga';
import Header from '../header/Index.jsx';
import Footer from '../footer/Index.jsx'
import Laser from '../laser/Index.jsx';
import P3D from '../p3d/Index.jsx';
import WriteAndDraw from '../writeAndDraw/Index.jsx'
import Code from '../code/Index.jsx';
import Settings from '../settings/Index.jsx';
import Basic from '../basic/Index.jsx'
import Terminal from './terminal/Index.jsx'
import Debug from '../debug/Index.jsx'

import {TAP_BASIC, TAP_LASER, TAP_P3D, TAB_WRITE_AND_DRAW, TAP_CODE, TAP_SETTINGS, TAP_DEBUG} from "../../constants.js";

import {actions as hotKeysActions} from "../../reducers/hotKeys";
import {actions as serialPortActions} from "../../reducers/serialPort";
import {actions as codeActions} from "../../reducers/code";
import {actions as socketActions} from "../../reducers/socket";
import {actions as gcodeSendActions} from "../../reducers/gcodeSend";
import {actions as tapsActions} from "../../reducers/taps"

import {actions as p3dPrintSettingsActions} from "../../reducers/p3dPrintSettings";
import {actions as p3dMaterialSettingsActions} from "../../reducers/p3dMaterialSettings";
import {actions as settingsGeneralActions} from "../../reducers/settingsGeneral";
import {actions as fontsActions} from "../../reducers/fonts";
import notificationI18n from "../../utils/notificationI18n";
import {withTranslation} from 'react-i18next';

import {getUuid} from '../../utils/index.js';
import {GA_tracking_id} from "./GA-tracking-id.json";

const notificationKey = getUuid();
const tooltipId = getUuid();

ReactGA.initialize(GA_tracking_id, {
    debug: false,
    titleCase: false,
    gaOptions: {
        userId: 123,
        siteSpeedSampleRate: 100
    }
});

class Index extends React.Component {
    constructor(props) {
        super(props);
        this.props.init();

        this.refBasic = React.createRef();
        this.refLaser = React.createRef();
        this.refP3D = React.createRef();
        this.refWriteAndDraw = React.createRef();
        this.refCode = React.createRef();
        this.refSettings = React.createRef();
        this.refDebug = React.createRef();
    }

    actions = {
        setTap: (value) => {
            this.props.setTap(value);
        },
    };

    componentDidMount() {
        this.displayTap(this.props.tap);

        // disable select text on document
        document.onselectstart = () => {
            return false;
        };
        //
        setInterval(() => {
            // ReactGA.ga('set', 'dimension1', 'Sports1');
            // ReactGA.ga('set', 'dimension2', 'Sports2');
            // ReactGA.ga('set', 'dimension3', 'Sports3');
            // ReactGA.ga('set', 'dimension4', 'Sports4');
            //
            // ReactGA.set({ dimension1: 'Sports1-1' });
            // ReactGA.set({ dimension2: 'Sports1-2' });
            // ReactGA.set({ dimension3: 'Sports1-3' });
            // ReactGA.set({ dimension4: 'Sports1-4' });

            // ReactGA.event({
            //     category: 'Promotion',
            //     action: 'Displayed Promotional Widget',
            //     label: 'Homepage Thing',
            //     nonInteraction: true
            // });

            if (this.props.socketStatus === "disconnect") {
                notificationI18n.error({
                    key: notificationKey,
                    message: 'Internal error occurred',
                    description: 'Please restart the app',
                    duration: 0
                });
            } else if (this.props.socketStatus === "connect") {
                notificationI18n.close(notificationKey);
            }
        }, 3000)
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.tap !== nextProps.tap) {
            this.displayTap(nextProps.tap)
        }
    }

    // 因为code和laser中都用到了canvas，canvas必须根据parent element计算其size，才能正常显示
    // 如此写，可以实现，先计算parent element的size，再显示指定的tap
    displayTap = (tap) => {
        // ReactGA.pageview(tap)
        ReactGA.event({
            category: 'open tap',
            action: tap
        });

        this.refBasic.current.style.display = 'none';
        this.refLaser.current.style.display = 'none';
        this.refP3D.current.style.display = 'none';
        this.refWriteAndDraw.current.style.display = 'none';
        this.refCode.current.style.display = 'none';
        this.refSettings.current.style.display = 'none';
        this.refDebug.current.style.display = 'none';
        switch (tap) {
            case TAP_BASIC:
                this.refBasic.current.style.display = 'block';
                break;
            case TAP_LASER:
                this.refLaser.current.style.display = 'block';
                break;
            case TAP_P3D:
                this.refP3D.current.style.display = 'block';
                break;
            case TAB_WRITE_AND_DRAW:
                this.refWriteAndDraw.current.style.display = 'block';
                break;
            case TAP_CODE:
                this.refCode.current.style.display = 'block';
                break;
            case TAP_SETTINGS:
                this.refSettings.current.style.display = 'block';
                break;
            case TAP_DEBUG:
                this.refDebug.current.style.display = 'block';
                break;
        }
    };

    render() {
        const actions = this.actions;
        const {tap} = this.props;
        const {t} = this.props;
        return (
            <div>
                <div className={styles.div_header}>
                    <Header/>
                </div>
                <div className={styles.div_tap_bar}>
                    <Tooltip
                        id={tooltipId}
                        place="right"/>
                    <button
                        data-for={tooltipId}
                        data-tip={t("Basic")}
                        onClick={() => actions.setTap(TAP_BASIC)}
                        className={tap === TAP_BASIC ? styles.btn_basic_selected : styles.btn_basic}
                    />
                    <button
                        data-for={tooltipId}
                        data-tip={t("Write&Draw")}
                        onClick={() => actions.setTap(TAB_WRITE_AND_DRAW)}
                        className={tap === TAB_WRITE_AND_DRAW ? styles.btn_write_and_draw_selected : styles.btn_write_and_draw}
                    />
                    <button
                        data-for={tooltipId}
                        data-tip={t("Laser")}
                        onClick={() => actions.setTap(TAP_LASER)}
                        className={tap === TAP_LASER ? styles.btn_laser_selected : styles.btn_laser}
                    />
                    <button
                        data-for={tooltipId}
                        data-tip={t("3D Print")}
                        onClick={() => actions.setTap(TAP_P3D)}
                        className={tap === TAP_P3D ? styles.btn_3d_selected : styles.btn_3d}
                    />
                    <button
                        data-for={tooltipId}
                        data-tip={t("Code")}
                        onClick={() => actions.setTap(TAP_CODE)}
                        className={tap === TAP_CODE ? styles.btn_code_selected : styles.btn_code}
                    />
                    <button
                        data-for={tooltipId}
                        data-tip={t("Settings")}
                        onClick={() => actions.setTap(TAP_SETTINGS)}
                        className={tap === TAP_SETTINGS ? styles.btn_settings_selected : styles.btn_settings}
                    />
                    {/*<button*/}
                    {/*data-for={tooltipId}*/}
                    {/*data-tip={t("Debug")}*/}
                    {/*onClick={() => actions.setTap(TAP_DEBUG)}*/}
                    {/*className={tap === TAP_DEBUG ? styles.btn_debug_selected : styles.btn_debug}*/}
                    {/*/>*/}
                </div>
                <div className={styles.div_workspace}>
                    <div ref={this.refBasic}>
                        <Basic/>
                    </div>
                    <div ref={this.refLaser}>
                        <Laser/>
                    </div>
                    <div ref={this.refP3D}>
                        <P3D/>
                    </div>
                    <div ref={this.refWriteAndDraw}>
                        <WriteAndDraw/>
                    </div>
                    <div ref={this.refCode}>
                        <Code/>
                    </div>
                    <div ref={this.refSettings}>
                        <Settings/>
                    </div>
                    <div ref={this.refDebug}>
                        <Debug/>
                    </div>
                </div>
                <Terminal/>
                <Footer/>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {tap} = state.taps;
    const {status: socketStatus} = state.socket;
    return {
        tap,
        socketStatus
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setTap: (value) => dispatch(tapsActions.setTap(value)),
        init: () => {
            dispatch(socketActions.init()); //必须首先执行
            dispatch(gcodeSendActions.init());
            dispatch(hotKeysActions.init());
            dispatch(serialPortActions.init());
            dispatch(codeActions.init());
            dispatch(settingsGeneralActions.init());
            //3dp
            dispatch(p3dMaterialSettingsActions.init());
            dispatch(p3dPrintSettingsActions.init());
            dispatch(fontsActions.init());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));
