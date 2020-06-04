import React from 'react';
import {Tabs} from 'antd';
import "antd/dist/antd.css";

import Canvas2D from './ui/Canvas2D/Index.jsx'
import ToolBar from '../../components/ToolBar/Index.jsx'

import Config from "./ui/Config/Index.jsx";
import Control from "./ui/Control/Index.jsx";

import styles from './styles.css';
import {actions as writeAndDrawActions} from "../../reducers/writeAndDraw";
import {connect} from 'react-redux';

const {TabPane} = Tabs;

class Index extends React.Component {
    operations = {
        undo: () => {
            this.props.undo();
        },
        redo: () => {
            this.props.redo();
        },
        duplicate: () => {
            this.props.duplicateSelected();
        },
        del: () => {
            this.props.removeSelected();
        },
        clear: () => {
            this.props.removeAll();
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
                    <Canvas2D/>
                </div>
                <div style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    right: "240px",
                    width: "36px",
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
                    backgroundColor: "#f0f",
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

const mapDispatchToProps = (dispatch) => {
    return {
        removeSelected: () => dispatch(writeAndDrawActions.removeSelected()),
        removeAll: () => dispatch(writeAndDrawActions.removeAll()),
        duplicateSelected: () => dispatch(writeAndDrawActions.duplicateSelected()),
        undo: () => dispatch(writeAndDrawActions.undo()),
        redo: () => dispatch(writeAndDrawActions.redo()),
    };
};

export default connect(null, mapDispatchToProps)(Index);







