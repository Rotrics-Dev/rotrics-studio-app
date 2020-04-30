import React from 'react';
import ReactTooltip from "react-tooltip";
import styles from './styles.css';
import Welcome from './Welcome/Index.jsx';
import Basic from './Basic/Index.jsx';
import Laser from './Laser/Index.jsx';
import WriteDraw from './WriteDraw/Index.jsx';
import Settings from './Settings/Index.jsx';

import Init from './Init.jsx';

import DebugSocket from './Debug/Socket.jsx';
import DebugHttpServer from './Debug/HttpServer.jsx';

import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import reducer from '../reducers';

const reduxStore = createStore(reducer, applyMiddleware(thunk));

class Index extends React.Component {
    state = {
        tap: "DebugSocket"
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
                    <div className={styles.div_header}></div>
                    <div className={styles.div_tap_bar}>
                        <ReactTooltip place="right" type="info" effect="solid"/>
                        <button
                            data-tip="Welcome"
                            onClick={() => actions.changeTap("welcome")}
                            className={styles.btn_welcome}
                        />
                        <button
                            data-tip="Basic"
                            onClick={() => actions.changeTap("basic")}
                            className={styles.btn_welcome}
                        />
                        <button
                            data-tip="Write/Draw"
                            onClick={() => actions.changeTap("writeDraw")}
                            className={styles.btn_welcome}
                        />
                        <button
                            data-tip="Laser"
                            onClick={() => actions.changeTap("laser")}
                            className={styles.btn_welcome}
                        />
                        <button
                            data-tip="Settings"
                            onClick={() => actions.changeTap("settings")}
                            className={styles.btn_welcome}
                        />
                    </div>
                    <div className={styles.div_workspace}>
                        {tap === "welcome" && <Welcome/>}
                        {tap === "basic" && <Basic/>}
                        {tap === "writeDraw" && <WriteDraw/>}
                        {tap === "laser" && <Laser/>}
                        {tap === "settings" && <Settings/>}
                        {tap === "DebugSocket" && <DebugSocket/>}
                        {tap === "DebugHttpServer" && <DebugHttpServer/>}
                    </div>
                </div>
            </Provider>
        )
    }
}

export default Index;
