import React from 'react';
import styles from './styles.css';

import DeviceControl from "../../DeviceControl/Index.jsx";

class Index extends React.Component {
    state = {};

    actions = {
        onClickToUpload: () => {
        },
    };

    render() {
        const actions = this.actions;
        return (
            <div>
                <DeviceControl/>
            </div>
        )
    }
}

export default Index;
