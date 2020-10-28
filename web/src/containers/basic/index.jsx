import React from 'react';
import {Tabs} from 'antd';
import Canvas2D from '../writeAndDraw/ui/Canvas2D/Index.jsx';
import TeachAndPlay from './ui/TeachAndPlay/Index.jsx';
import Gcode from './ui/Gcode/Index.jsx';
import {withTranslation} from 'react-i18next';
import layout_styles from '../layout_styles.css';

class Index extends React.Component {

    render() {
        const {t} = this.props;
        return (
            <div>
                <div className={layout_styles.div_canvas}>
                    <Canvas2D/>
                </div>
                <div style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    right: "375px",
                    width: "35px",
                    height: "100%",
                    border: "1px solid #C0C0C0",
                    borderTopWidth: 0,
                    borderBottomWidth: 0,
                    backgroundColor: "#ECECEC"
                }}/>
                <div className={layout_styles.div_right_panel}>
                    <Tabs centered={true} size="small">
                        <Tabs.TabPane tab={t('G-code')} key="2">
                            <Gcode/>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab={t('Teach & Play')} key="3">
                            <TeachAndPlay/>
                        </Tabs.TabPane>
                    </Tabs>
                </div>
            </div>
        )
    }
}

export default withTranslation()(Index);







