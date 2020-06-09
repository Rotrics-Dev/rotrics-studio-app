import React from 'react';
import styles from './styles.css';
import Material from './Material.jsx';
import Setting from './Setting.jsx';

class Index extends React.Component {
    state = {};

    render() {
        return (
            <div>
                <Material/>
                <Setting/>
            </div>
        )
    }
}

export default Index;
