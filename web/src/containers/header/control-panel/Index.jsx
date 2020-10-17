import React from 'react';
import {connect} from 'react-redux';
import Draggable from 'react-draggable';
import {withTranslation} from 'react-i18next';
import ModuleControl from "./ModuleControl.jsx";
import JogPanel from "./JogPanel.jsx";
import styles from './styles.css';
import {actions as headerActions} from "../../../reducers/header";

class Index extends React.Component {
    state = {
        position: {x: 0, y: 0},
    };

    render() {
        if (!this.props.jogPanelVisible) {
            return null;
        }
        const state = this.state;
        const {changeVisibility4jogPanel} = this.props;
        const {t} = this.props;
        return (
            <Draggable
                handle="#handle"
                defaultPosition={state.position}
                onStop={(e, data) => {
                    const {x, y} = data;
                    this.setState({position: {x, y}})
                }}>
                <div className={styles.div_root}>
                    <div id="handle" className={styles.div_header}>
                        <label className={styles.label_title}>{t('Control Panel')}</label>
                        <input
                            type="button"
                            className={styles.btn_close}
                            onClick={() => {
                                changeVisibility4jogPanel(false)
                            }}
                        />
                    </div>
                    <div className={styles.div_container}>
                        <JogPanel/>
                        <ModuleControl/>
                    </div>
                </div>
            </Draggable>
        )
    }
}

const mapStateToProps = (state) => {
    const {jogPanelVisible} = state.header;
    return {
        jogPanelVisible
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        changeVisibility4jogPanel: (value) => dispatch(headerActions.changeVisibility4jogPanel(value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));
