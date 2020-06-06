import React from 'react';
import {Tabs} from 'antd';
import "antd/dist/antd.css";

import ToolBar from '../../components/ToolBar/Index.jsx'

import Upload from "./ui/Upload/Index.jsx";
import Transformation from "./ui/Transformation/Index.jsx";
import Canvas3D from "./ui/Canvas3D/Index.jsx";
import Progress from "./ui/Progress/Index.jsx";
import Info from "./ui/Info/Index.jsx";

import Config from "./ui/Config/Index.jsx";
import Control from "./ui/Control/Index.jsx";

import styles from './styles.css';

const {TabPane} = Tabs;

class Index extends React.Component {
    operations = {
        undo: () => {
            console.log("undo")
        },
        redo: () => {
            console.log("redo")
        },
        duplicate: () => {
            console.log("duplicate")
        },
        del: () => {
            console.log("del")
        },
        clear: () => {
            console.log("clear")
        }
    };

    render() {
        const operations = this.operations;
        const actions = this.actions;
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
                    right: "276px",
                    backgroundColor: "#e0e0e0"
                }}>
                    <Canvas3D/>
                </div>
                <div style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px"
                }}>
                    <Upload/>
                </div>
                <div className={styles.div_transformation}>
                    <Transformation/>
                </div>
                <div style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: "5px",
                    backgroundColor: "#ff0000"
                }}>
                    <Progress/>
                </div>
                <div style={{
                    position: "absolute",
                    bottom: 0,
                    right: "276px",
                    height: "50px",
                    width: "50px",
                    backgroundColor: "#000000"
                }}>
                    <Info/>
                </div>
                <div style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    right: "240px",
                    width: "40px",
                    backgroundColor: "#ff0000"
                }}>
                    <ToolBar operations={operations}/>
                </div>
                <div style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: "240px",
                    backgroundColor: "#f0f0f0",
                    overflowY: "scroll"
                }}>
                    <Tabs type="card" tabBarGutter={0} tabBarStyle={{width: "240px"}}>
                        <TabPane tab={
                            <div style={{textAlign: "center", width: "86px", height: "100%"}}>
                                G-code
                            </div>
                        } key="1">
                            <Config/>
                        </TabPane>
                        <TabPane tab={
                            <div style={{textAlign: "center", width: "86px", height: "100%"}}>
                                Control
                            </div>
                        } key="2">
                            <Control/>
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        )
    }
}

export default Index;
