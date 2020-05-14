import React from 'react';
import styles from './styles.css';

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
                <h1>{"P3D"}</h1>
            </div>
        )
    }
}

export default Index;
