import React from 'react';
import styles from './styles.css';
import CodeSpace from "./CodeSpace.jsx";

class Index extends React.Component {
    render() {
        return (
            <div style={{
                width: "100%", height: "100%"
            }}>
                <CodeSpace/>
            </div>
        )
    }
}

export default Index;
