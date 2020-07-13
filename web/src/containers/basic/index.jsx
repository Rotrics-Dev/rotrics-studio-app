import React from 'react';
import {Tabs} from 'antd';
import "antd/dist/antd.css";
import Canvas2D from '../writeAndDraw/ui/Canvas2D/Index.jsx';
import TeachAndPlay from './ui/TeachAndPlay/Index.jsx';
import Gcode from './ui/Gcode/Index.jsx';
import Control from './ui/Control/Index.jsx';

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
                    right: "351px"
                }}>
                    <Canvas2D/>
                </div>
                <div style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    right: "315px",
                    width: "36px",
                    border: "1px solid #C0C0C0",
                    borderTopWidth: 0,
                    borderBottomWidth: 0,
                    backgroundColor: "#ECECEC"

                }}/>
                <div style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: "315px",
                    backgroundColor: "#F2F2F2",
                    overflowY: "scroll"
                }}>
                    <Tabs type="card" centered={true} size="small" tabBarGutter={0}
                          tabBarStyle={{height: "30px", width: "100%", marginBottom: "8px"}}>
                        <TabPane tab={
                            <div style={{textAlign: "center", fontSize: "15px", width: "52px", height: "100%"}}>
                                Control
                            </div>
                        } key="3">
                            <Control/>
                        </TabPane>
                        <TabPane tab={
                            <div style={{textAlign: "center", fontSize: "15px", width: "52px", height: "100%"}}>
                                Gcode
                            </div>
                        } key="2">
                            <Gcode/>
                        </TabPane>
                        <TabPane tab={
                            <div style={{textAlign: "center", fontSize: "15px", width: "76px", height: "100%"}}>
                                Teach & Play
                            </div>
                        } key="1">
                            <TeachAndPlay/>
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        )
    }
}

export default Index;







