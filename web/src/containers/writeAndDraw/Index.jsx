import React from 'react';
import {Tabs} from 'antd';
import "antd/dist/antd.css";

import Canvas2D from './ui/Canvas2D/Index.jsx'
import ToolBarI18n from '../ToolBarI18n/Index.jsx'
import Config from "./ui/Config/Index.jsx";
import Control from "./ui/Control/Index.jsx";

import styles from './styles.css';
import {actions as writeAndDrawActions} from "../../reducers/writeAndDraw";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';

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
        const {t} = this.props;
        const {model, modelCount} = this.props;
        const operations = this.operations;
        const enabledInfo = {duplicate: !!model, del: !!model, clear: (modelCount > 0)};
        const visibleInfo = {undo: false, redo: false, layFlat: false, duplicate: false, del: true, clear: true};
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
                    right: "351px"
                }}>
                    <Canvas2D/>
                </div>
                <div style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    right: "315px",
                    width: "36px"
                }}>
                    <ToolBarI18n operations={operations} enabledInfo={enabledInfo} visibleInfo={visibleInfo}/>
                </div>
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
                            <div style={{textAlign: "center", fontSize: "15px", width: "107px", height: "100%"}}>
                                {t("G-code")}
                            </div>
                        } key="1">
                            <Config/>
                        </TabPane>
                        <TabPane tab={
                            <div style={{textAlign: "center", fontSize: "15px", width: "107px", height: "100%"}}>
                                {t('Control')}
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
    const {model, modelCount} = state.writeAndDraw;
    return {
        model,
        modelCount
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        removeSelected: () => dispatch(writeAndDrawActions.removeSelected()),
        removeAll: () => dispatch(writeAndDrawActions.removeAll()),
        duplicateSelected: () => dispatch(writeAndDrawActions.duplicateSelected()),
        undo: () => dispatch(writeAndDrawActions.undo()),
        redo: () => dispatch(writeAndDrawActions.redo()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index));







