import React from 'react';
import styles from './styles.css';
import Workspace from "./Workspace.jsx";

class Index extends React.Component {
    render() {
        return (
            <div style={{width: "100%", height: "100%"}}>
                <Workspace/>
            </div>
        )
    }
}

export default Index;
