import React from 'react';
import {Space} from 'antd';
import styles from './styles.css';

class Index extends React.Component {
    render() {
        return (
            <Space size={0} style={{position: "absolute", right: 0}}>
                <a href="https://www.rotrics.com" target="_blank" rel="noopener noreferrer">
                    <button className={styles.btn_official_website}/>
                </a>
                <a href="https://www.manual.rotrics.com" target="_blank" rel="noopener noreferrer">
                    <button className={styles.btn_manual}/>
                </a>
                <a href="https://discord.gg/Xd7X8EW" target="_blank" rel="noopener noreferrer">
                    <button className={styles.btn_forum}/>
                </a>
                <a href="https://github.com/Rotrics-Dev/rotrics-studio-app-issue/issues" target="_blank" rel="noopener noreferrer">
                    <button className={styles.btn_feedback}/>
                </a>
            </Space>
        )
    }
}

export default Index;
