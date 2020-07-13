import React from 'react';
import styles from './styles.css';

class footer extends React.Component {
    render() {
        return (
            <div
                className={styles.footer}>
                <a href="https://github.com/Rotrics-Dev/rotrics-studio-app-issue/issues" target="_blank" rel="noopener noreferrer">
                    <img className={styles.img_feedback}/>
                </a>
                <img className={styles.img_logo}/>
            </div>
        )
    }
}

export default footer;
