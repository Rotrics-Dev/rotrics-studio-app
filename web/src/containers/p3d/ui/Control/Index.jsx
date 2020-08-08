import React from 'react';
import styles from './styles.css';
import DeviceControl from "../../../_deviceControl/Index.jsx"

class Index extends React.Component {
    render() {
        return (
            <div>
                <DeviceControl showLevel={true}/>
            </div>
        )
    }
}

export default Index;

