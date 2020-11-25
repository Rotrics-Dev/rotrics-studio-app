import React from 'react';
import {connect} from 'react-redux';
import Canvas2D from '../Model2D/Canvas2D/Index.jsx';
import ToolBarI18n from '../ToolBarI18n/Index.jsx'
import RightPanel from "./ui/RightPanel/Index.jsx";
import layout_styles from '../layout_styles.css';
import {actions as laserActions} from "../../reducers/laser";

class Index extends React.Component {
    render() {
        const {tap, model, setRendererParent, selectModel, updateTransformation} = this.props;
        return (
            <div>
                <div className={layout_styles.div_canvas}>
                    <Canvas2D
                        tap={tap}
                        model={model}
                        setRendererParent={setRendererParent}
                        selectModel={selectModel}
                        updateTransformation={updateTransformation}
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
    const {model} = state.laser;
    return {
        tap,
        model
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setRendererParent: (modelsParent) => dispatch(laserActions.setRendererParent(modelsParent)),
        selectModel: (model) => dispatch(laserActions.selectModel(model)),
        updateTransformation: (key, value, preview) => dispatch(laserActions.updateTransformation(key, value, preview)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);









