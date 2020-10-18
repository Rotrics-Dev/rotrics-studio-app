import React from 'react';
import {connect} from 'react-redux';
import Draggable from 'react-draggable';
import {withTranslation} from 'react-i18next';
import ModuleControl from "./ModuleControl/Index.jsx";
import JogPanel from "./jog-panel/Index.jsx";
import PositionMonitor from "./PositionMoniter/index.jsx";
import styles from './styles.css';
import {actions as headerActions} from "../../../reducers/header";

class Index extends React.Component {
    state = {
        transparent: false,
        position: {x: 0, y: 0},
    };

    actions = {
        toggleTransparent: () => {
            const transparent = !this.state.transparent;
            this.setState({transparent})
        }
    };

    render() {
        if (!this.props.controlPanelVisible) {
            return null;
        }
        const actions = this.actions;
        const state = this.state;
        const {changeVisible4controlPanel} = this.props;
        const {t} = this.props;
        return (
            <Draggable
                handle="#handle"
                defaultPosition={state.position}
                onStop={(e, data) => {
                    const {x, y} = data;
                    this.setState({position: {x, y}})
                }}>
                <div className={state.transparent ? styles.div_root_transparent : styles.div_root}>

                    <div id="handle" className={styles.div_header}>
                        <label className={styles.label_title}>{t('Control Panel')}</label>
                         <input
                            type="button"
                            className={styles.btn_close}
                            onClick={() => {
                                changeVisible4controlPanel(false)
                            }}
                        />
                        <input type="button" className={styles.btn_transparent} onClick={actions.toggleTransparent}/>
                    </div>
                    <div className={styles.div_container}>
                        <PositionMonitor/>
                        <JogPanel/>
                        <ModuleControl/>
                    </div>
                </div>
            </Draggable>
        )
    }
}

const mapStateToProps = (state) => {
    const {controlPanelVisible} = state.header;
    return {
        controlPanelVisible
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        changeVisible4controlPanel: (value) => dispatch(headerActions.changeVisible4controlPanel(value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));
