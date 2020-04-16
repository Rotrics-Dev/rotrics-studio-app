import React from 'react';
import ReactTooltip from "react-tooltip";
import styles from './styles.css';
import Welcome from './Welcome/Index.jsx';
import Basic from './Basic/Index.jsx';
import Laser from './Laser/Index.jsx';
import WriteDraw from './WriteDraw/Index.jsx';
import Settings from './Settings/Index.jsx';

class Index extends React.Component {
    state = {
        tap: "basic"
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
            <div>
                <div className={styles.div_header}></div>
                <div className={styles.div_tap_bar}>
                    <ReactTooltip place="right" type="info" effect="solid"/>
                    <button
                        data-tip="welcome"
                        onClick={() => actions.changeTap("welcome")}
                        className={styles.btn_welcome}
                    />
                    <button
                        data-tip="basic"
                        onClick={() => actions.changeTap("basic")}
                        className={styles.btn_welcome}
                    />
                    <button
                        data-tip="writeDraw"
                        onClick={() => actions.changeTap("writeDraw")}
                        className={styles.btn_welcome}
                    />
                    <button
                        data-tip="laser"
                        onClick={() => actions.changeTap("laser")}
                        className={styles.btn_welcome}
                    />
                    <button
                        data-tip="settings"
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
                </div>
            </div>
        )
    }
}

export default Index;
