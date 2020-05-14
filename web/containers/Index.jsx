import React from 'react';
import ReactTooltip from "react-tooltip";
import styles from './styles.css';

import Init from './Init.jsx';
import Header from './Header/Index.jsx';

import WriteDraw from './WriteDraw/Index.jsx';
import Laser from './Laser/Index.jsx';
import P3D from './P3D/Index.jsx';
import Code from './Code/Index.jsx';
import Settings from './Settings/Index.jsx';

import DeviceControl from './Debug/DeviceControl.jsx';
import DebugHttpServer from './Debug/HttpServer.jsx';

import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import reducer from '../reducers';

const reduxStore = createStore(reducer, applyMiddleware(thunk));

class Index extends React.Component {
    state = {
        tap: "DeviceControl"
    };

    actions = {
        changeTap: (tap) => {
            console.log(tap);
            this.setState({tap})
        },
    };

    render() {
        const state = this.state;
        const actions = this.actions;
        const {tap} = state;
        return (
            <Provider store={reduxStore}>
                <div>
                    <Init/>
                    <div className={styles.div_header}>
                        <Header/>
                    </div>
                    <div className={styles.div_tap_bar}>
                        <ReactTooltip place="right" type="info" effect="solid" backgroundColor="#c0c0c0"
                                      textColor="#292421"/>
                        <button
                            data-tip="Write/Draw"
                            onClick={() => actions.changeTap("Write/Draw")}
                            className={styles.btn_write_draw}
                        />
                        <button
                            data-tip="Laser"
                            onClick={() => actions.changeTap("Laser")}
                            className={styles.btn_laser}
                        />
                        <button
                            data-tip="3D Print"
                            onClick={() => actions.changeTap("P3D")}
                            className={styles.btn_3d}
                        />
                        <button
                            data-tip="Code"
                            onClick={() => actions.changeTap("Code")}
                            className={styles.btn_code}
                        />
                        <button
                            data-tip="Settings"
                            onClick={() => actions.changeTap("Settings")}
                            className={styles.btn_settings}
                        />
                    </div>
                    <div className={styles.div_workspace}>
                        {tap === "Write/Draw" && <WriteDraw/>}
                        {tap === "Laser" && <Laser/>}
                        {tap === "P3D" && <P3D/>}
                        {tap === "Code" && <Code/>}
                        {tap === "Settings" && <Settings/>}

                        {tap === "DeviceControl" && <DeviceControl/>}
                        {tap === "DebugHttpServer" && <DebugHttpServer/>}
                    </div>
                </div>
            </Provider>
        )
    }
}

export default Index;
