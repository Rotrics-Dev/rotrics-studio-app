import React from 'react';
import {Canvas2dPen as Canvas2D} from './ui/Canvas2D/Index.jsx'
import ToolBarI18n from '../ToolBarI18n/Index.jsx'
import Config from "./ui/Config/Index.jsx";
import {actions as writeAndDrawActions} from "../../reducers/writeAndDraw";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import layout_styles from '../layout_styles.css';

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
        const {t} = this.props;
        const {model, modelCount} = this.props;
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
    const {model, modelCount} = state.writeAndDraw;
    return {
        model,
        modelCount
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        removeSelected: () => dispatch(writeAndDrawActions.removeSelected()),
        removeAll: () => dispatch(writeAndDrawActions.removeAll()),
        duplicateSelected: () => dispatch(writeAndDrawActions.duplicateSelected()),
        undo: () => dispatch(writeAndDrawActions.undo()),
        redo: () => dispatch(writeAndDrawActions.redo()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));







