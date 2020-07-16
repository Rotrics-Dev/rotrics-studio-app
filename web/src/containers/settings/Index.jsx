import React from 'react';
import {Menu} from 'antd';
import styles from './styles.css';
import General from "./General.jsx";
import Config from "./Config.jsx";

class Index extends React.Component {
    state = {
        key: "General" //当前选中的Menu.Item
    };

    actions = {
        changeKey: (e) => {
            this.setState({key: e.key})
        },
    };

    render() {
        const state = this.state;
        const {key} = state;
        const actions = this.actions;
        return (
            <div className={styles.div_container}>
                <Menu
                    onClick={actions.changeKey}
                    className={styles.menu}
                    defaultSelectedKeys={[state.key]}
                    mode="inline"
                >
                    <Menu.Item key="General">General</Menu.Item>
                    <Menu.Item key="Config">Config</Menu.Item>
                    {/*<Menu.Item key="About">About</Menu.Item>*/}
                    {/*<Menu.Item key="Console">About</Menu.Item>*/}
                </Menu>
                {key === 'General' &&
                <General/>
                }
                {key === 'Config' &&
                <div className={styles.div_content}>
                    <Config/>
                </div>
                }
                {key === 'About' &&
                <div className={styles.div_content}>
                    About
                </div>
                }
            </div>
        )
    }
}

export default Index;
