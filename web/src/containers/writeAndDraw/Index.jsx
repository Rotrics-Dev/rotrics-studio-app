import React from 'react';
import Canvas2D from './ui/Canvas2D/Index.jsx'
import ToolBarI18n from '../ToolBarI18n/Index.jsx'
import RightPanel from "./ui/RightPanel/Index.jsx";
import layout_styles from '../layout_styles.css';

class Index extends React.Component {
    render() {
        return (
            <div>
                <div className={layout_styles.div_canvas}>
                    <Canvas2D/>
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

export default Index;







