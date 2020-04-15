import React from 'react';
import styles from './Component.css';

let index = 0;

class Component extends React.Component {
    state = {
        msg: ""
    };

    componentDidMount() {
        setInterval(() => {
            this.setState({msg: ++index})
        }, 1000)
    }

    render() {
        return (
            <div>
                <div className={styles.header}></div>
                <div className={styles.tap_bar}></div>
            </div>
        )
    }
}

export default Component;
