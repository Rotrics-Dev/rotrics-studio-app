import React from 'react';
import ToolBarI18n from '../ToolBarI18n/Index.jsx'
import OpenModel from "./ui/OpenModel/Index.jsx";
import Transformation from "./ui/Transformation/Index.jsx";
import Canvas3D from "./ui/Canvas3D/Index.jsx";
import Progress from "./ui/Progress/Index.jsx";
import Info from "./ui/Info/Index.jsx";
import GcodePreviewControl from "./ui/GcodePreviewControl/Index.jsx";
import RightPanel from "./ui/RightPanel/Index.jsx";
import styles from './styles.css';
import layout_styles from '../layout_styles.css';

class Index extends React.Component {
    render() {
        return (
            <div>
                <div className={layout_styles.div_canvas}>
                    <Canvas3D/>
                </div>
                <div style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px"
                }}>
                    <OpenModel/>
                </div>
                <div className={styles.div_transformation}>
                    <Transformation/>
                </div>
                <div className={styles.div_gcode_preview_control}>
                    <GcodePreviewControl/>
                </div>
                <div className={styles.div_progress}>
                    <Progress/>
                </div>
                <div className={styles.div_info}>
                    <Info/>
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
