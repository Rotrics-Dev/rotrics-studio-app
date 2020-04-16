import React from 'react';
import styles from './styles.css';
import { Button, message } from 'antd';
import "antd/dist/antd.css";

class Index extends React.Component {
    state = {
        current: "basic" // basic, function, g-code
    };

    render() {
        return (
            <div>
                <h1>{"basic"}</h1>
                <div className={styles.div_primary_panel}>

                </div>
                <div className={styles.div_easy_control_panel}>
                    <Button type="primary">
                        Primary Button
                    </Button>
                </div>
            </div>
        )
    }
}

export default Index;
