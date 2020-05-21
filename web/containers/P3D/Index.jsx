import React from 'react';
import {Tabs} from 'antd';
import "antd/dist/antd.css";

import CoordinateSystem2D from '../../components/CoordinateSystem2D/Index.jsx'
import OperationPanel from '../../components/OperationPanel/Index.jsx'

import LeftPanel from "./LeftPanel/Index.jsx";
import Canvas3D from "./Canvas3D/Index.jsx";
import Progress from "./Progress/Index.jsx";
import Info from "./Info/Index.jsx";

import Config from "./Config/Index.jsx";
import Control from "./Control/Index.jsx";

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
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: "100px"
                }}>
                    <LeftPanel/>
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
                    width: "36px",
                    backgroundColor: "#ff0000"
                }}>
                    <OperationPanel operations={operations}/>
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
