import React from 'react';
import {Tabs} from 'antd';
import "antd/dist/antd.css";

import CoordinateSystem2D from '../../components/CoordinateSystem2D/Index.jsx'
import OperationPanel from '../../components/OperationPanel/Index.jsx'

import Config from "./Config/Index.jsx";
import Control from "./Control/Index.jsx";

import styles from './styles.css';
import laserManager from "../../laser/laserManager";

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
            laserManager.duplicateSelected();
        },
        del: () => {
            laserManager.removeSelected();
        },
        clear: () => {
            laserManager.removeAll();
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
                    right: "276px"
                }}>
                    <CoordinateSystem2D/>
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
