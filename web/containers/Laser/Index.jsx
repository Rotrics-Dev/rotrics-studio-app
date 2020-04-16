import React from 'react';
import styles from './styles.css';
import CoordinateSystem2D from '../../components/CoordinateSystem2D/Index.jsx'

class Index extends React.Component {
    state = {};

    render() {
        return (
            <div style={{
                width: "100%",
                height: "100%"
            }}>
                <CoordinateSystem2D/>
            </div>
        )
    }
}

export default Index;
