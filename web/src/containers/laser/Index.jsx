import React from 'react';
import {Tabs} from 'antd';
import {Canvas2dLaser as Canvas2D} from './../writeAndDraw/ui/Canvas2D/Index.jsx'
import ToolBarI18n from '../ToolBarI18n/Index.jsx'
import Config from "./ui/Config/Index.jsx";
import {actions as laserActions} from "../../reducers/laser";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import layout_styles from '../layout_styles.css';

const {TabPane} = Tabs;

class Index extends React.Component {
    operations = {
        undo: () => {
            this.props.undo();
        },
        redo: () => {
            this.props.redo();
        },
        duplicate: () => {
            this.props.duplicateSelected();
        },
        del: () => {
            this.props.removeSelected();
        },
        clear: () => {
            this.props.removeAll();
        }
    };

    render() {
        const {model, modelCount} = this.props;
        const {t} = this.props;
        const operations = this.operations;
        const enabledInfo = {duplicate: !!model, del: !!model, clear: (modelCount > 0)};
        const visibleInfo = {undo: false, redo: false, layFlat: false, duplicate: false, del: true, clear: true};
        const actions = this.actions;
        return (
            <div>
                <div className={layout_styles.div_canvas}>
                    <Canvas2D/>
                </div>
                <div className={layout_styles.div_tool_bar}>
                    <ToolBarI18n operations={operations} enabledInfo={enabledInfo} visibleInfo={visibleInfo}/>
                </div>
                <div className={layout_styles.div_right_panel}>
                    <Config/>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {model, modelCount} = state.laser;
    return {
        model,
        modelCount
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        removeSelected: () => dispatch(laserActions.removeSelected()),
        removeAll: () => dispatch(laserActions.removeAll()),
        duplicateSelected: () => dispatch(laserActions.duplicateSelected()),
        undo: () => dispatch(laserActions.undo()),
        redo: () => dispatch(laserActions.redo()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));







