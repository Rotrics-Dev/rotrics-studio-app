import React from 'react';
import ReactTooltip from "react-tooltip";
import styles from './styles.css';

import Header from '../header/Index.jsx';

import Laser from '../laser/Index.jsx';
import P3D from '../p3d/Index.jsx';
import Code from '../code/Index.jsx';
import Settings from '../settings/Index.jsx';

import {TAP_LASER, TAP_P3D, TAP_CODE, TAP_SETTINGS} from "../../constants.js";
import {actions as tapActions} from "../../reducers/tap";
import {connect} from 'react-redux';
import {actions as hotKeysActions} from "../../reducers/hotKeys";
import {actions as laserTextActions} from "../../reducers/laserText";
import {actions as serialPortActions} from "../../reducers/serialPort";
import {actions as vmActions} from "../../reducers/vm";
import {actions as socketActions} from "../../reducers/socket";
import {actions as gcodeSendActions} from "../../reducers/gcodeSend";

class Index extends React.Component {
    constructor(props) {
        super(props);
        this.props.init();

        this.refLaser = React.createRef();
        this.refP3D = React.createRef();
        this.refCode = React.createRef();
        this.refSettings = React.createRef();
    }

    actions = {
        setTap: (value) => {
            this.props.setTap(value);
        },
    };

    componentDidMount() {
        this.displayTap(this.props.tap)
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.tap !== nextProps.tap) {
            this.displayTap(nextProps.tap)
        }
    }

    // 因为code和laser中都用到了canvas，canvas必须根据parent element计算其size，才能正常显示
    // 如此写，可以实现，先计算parent element的size，再显示指定的tap
    displayTap = (tap) => {
        this.refLaser.current.style.display = 'none';
        this.refP3D.current.style.display = 'none';
        this.refCode.current.style.display = 'none';
        this.refSettings.current.style.display = 'none';
        switch (tap) {
            case TAP_LASER:
                this.refLaser.current.style.display = 'block';
                break;
            case TAP_P3D:
                this.refP3D.current.style.display = 'block';
                break;
            case TAP_CODE:
                this.refCode.current.style.display = 'block';
                break;
            case TAP_SETTINGS:
                this.refSettings.current.style.display = 'block';
                break;
        }
    };

    render() {
        const actions = this.actions;
        const {tap} = this.props;
        return (
            <div>
                <div className={styles.div_header}>
                    <Header/>
                </div>
                <div className={styles.div_tap_bar}>
                    <ReactTooltip place="right" type="info" effect="solid" backgroundColor="#c0c0c0"
                                  textColor="#292421"/>
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
                    <div ref={this.refLaser}>
                        <Laser/>
                    </div>
                    <div ref={this.refP3D}>
                        <P3D/>
                    </div>
                    <div ref={this.refCode}>
                        <Code/>
                    </div>
                    <div ref={this.refSettings}>
                        <Settings/>
                    </div>
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
        init: () => {
            dispatch(gcodeSendActions.init());
            dispatch(hotKeysActions.init());
            dispatch(laserTextActions.init());
            dispatch(serialPortActions.init());
            dispatch(socketActions.init());
            dispatch(vmActions.init());
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
