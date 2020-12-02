import React from 'react';
import {connect} from 'react-redux';
import Canvas2D from '../Model2D/Canvas2D/Index.jsx';
import ToolBarI18n from '../ToolBarI18n/Index.jsx'
import RightPanel from "./ui/RightPanel/Index.jsx";
import layout_styles from '../layout_styles.css';

class Index extends React.Component {
    render() {
        const {tap, model, modelParent} = this.props;
        return (
            <div>
                <div className={layout_styles.div_canvas}>
                    <Canvas2D
                        tap={tap}
                        model={model}
                        modelParent={modelParent}
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
    const {modelParentWriteDraw: modelParent, modelWriteDraw: model} = state.model2d;
    return {
        tap,
        model,
        modelParent
    };
};

export default connect(mapStateToProps)(Index);









