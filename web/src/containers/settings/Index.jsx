import React from 'react';
import {Menu} from 'antd';
import styles from './styles.css';
import General from "./General.jsx";
import Config from "./Config.jsx";
import {withTranslation} from 'react-i18next';

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
        const {t} = this.props;
        const state = this.state;
        const {key} = state;
        const actions = this.actions;
        return (
            <div className={styles.div_container}>
                <Menu
                    className={styles.menu}
                    onClick={actions.changeKey}
                    defaultSelectedKeys={[state.key]}
                >
                    <Menu.Item key="General">{t('General')}</Menu.Item>
                    <Menu.Item key="Config">{t('Config')}</Menu.Item>
                </Menu>
                <div className={styles.div_menu_item_container}>
                    {key === 'General' &&
                    <General/>
                    }
                    {key === 'Config' &&
                    <Config/>
                    }
                </div>

            </div>
        )
    }
}

export default withTranslation()(Index);
