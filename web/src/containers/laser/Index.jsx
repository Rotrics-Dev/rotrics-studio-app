import React from 'react';
import {connect} from 'react-redux';
import Canvas2D from '../Model2D/Canvas2D/Index.jsx';
import ToolBarI18n from '../ToolBarI18n/Index.jsx'
import RightPanel from "./ui/RightPanel/Index.jsx";
import layout_styles from '../layout_styles.css';
import {actions as laserActions} from "../../reducers/laser";

class Index extends React.Component {
    render() {
        const {tap, model, modelParent, selectModel} = this.props;
        return (
            <div>
                <div className={layout_styles.div_canvas}>
                    <Canvas2D
                        tap={tap}
                        model={model}
                        modelParent={modelParent}
                        selectModel={selectModel}
                    />
                </div>
                <div className={layout_styles.div_tool_bar}>
                    <ToolBarI18n/>
                </div>
                <div className={layout_styles.div_right_panel}>
                    <RightPanel/>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {tap} = state.taps;
    const {modelParent, model} = state.laser;
    return {
        tap,
        model,
        modelParent
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        selectModel: (model) => dispatch(laserActions.selectModel(model)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);









