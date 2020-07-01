import React from 'react';
import {Tabs} from 'antd';
import "antd/dist/antd.css";
import Canvas2D from '../writeAndDraw/ui/Canvas2D/Index.jsx';
import TeachAndPlay from './ui/TeachAndPlay/Index.jsx';
import Gcode from './ui/Gcode/Index.jsx';
import Control from './ui/Control/Index.jsx';
import ToolBar from '../../components/ToolBar/Index.jsx';

const {TabPane} = Tabs;

class Index extends React.Component {

    render() {
        const {model, modelCount} = this.props;
        const operations = this.operations;
        // const enabledInfo = {duplicate: !!model, del: !!model, clear: (modelCount > 0)};
        // const visibleInfo = {undo: false, redo: false, layFlat: false, duplicate: false, del: true, clear: true};
        return (
            <div style={{
                width: "100%",
                height: "100%",
            }}>
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: "280px"
                }}>
                    <Canvas2D/>
                </div>
                <div style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    right: "280px",
                    width: "1.5px",
                    backgroundColor: "#C0C0C0"
                }}/>
                <div style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: "280px",
                    backgroundColor: "#f0f0f0",
                    overflowY: "scroll"
                }}>
                    <Tabs type="card" tabBarGutter={0} tabBarStyle={{width: "260px"}}>
                        <TabPane tab={
                            <div style={{textAlign: "center", width: "76px", height: "100%"}}>
                                Teach & Play
                            </div>
                        } key="1" >
                            <TeachAndPlay/>
                        </TabPane>
                        <TabPane tab={
                            <div style={{textAlign: "center", width: "38px", height: "100%"}}>
                                Gcode
                            </div>
                        } key="2">
                            <Gcode/>
                        </TabPane>
                        <TabPane tab={
                            <div style={{textAlign: "center", width: "42px", height: "100%"}}>
                                Control
                            </div>
                        } key="3">
                            <Control/>
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        )
    }
}

export default Index;







