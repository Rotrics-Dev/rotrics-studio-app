import React from 'react';
import {Tabs} from 'antd';
import "antd/dist/antd.css";

import Canvas2D from './ui/Canvas2D/Index.jsx'
import ToolBar from '../../components/ToolBar/Index.jsx'

import Config from "./ui/Config/Index.jsx";
import Control from "./ui/Control/Index.jsx";

import styles from './styles.css';
import {actions as laserActions} from "../../reducers/laser";
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
        const {model, modelCount} = this.props;
        const operations = this.operations;
        const enabledInfo = {duplicate: !!model, del: !!model, clear: (modelCount>0)};
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
                    right: "320px"
                }}>
                    <Canvas2D/>
                </div>
                <div style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    right: "280px",
                    width: "40px",
                    backgroundColor: "#ff0000"
                }}>
                    <ToolBar operations={operations} enabledInfo={enabledInfo}/>
                </div>
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
                            <div style={{textAlign: "center", width: "95px", height: "100%"}}>
                                G-code
                            </div>
                        } key="1">
                            <Config/>
                        </TabPane>
                        <TabPane tab={
                            <div style={{textAlign: "center", width: "95px", height: "100%"}}>
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

const mapStateToProps = (state) => {
    const {model, modelCount} = state.laser;
    return {
        model,
        modelCount
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        removeSelected: () => dispatch(laserActions.removeSelected()),
        removeAll: () => dispatch(laserActions.removeAll()),
        duplicateSelected: () => dispatch(laserActions.duplicateSelected()),
        undo: () => dispatch(laserActions.undo()),
        redo: () => dispatch(laserActions.redo()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);







