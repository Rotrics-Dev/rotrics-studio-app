import React, {PureComponent} from 'react';
import {Button} from 'antd';
import styles from './styles.css';
import i18next from 'i18next'

class Index extends PureComponent {
    render() {
        const {text = "", onClick, ...rest} = this.props;
        return (
            <Button
                block
                size="small"
                className={styles.style_default}
                {...rest}
                onClick={onClick}
            >
                {i18next.t(text)}
            </Button>
        );
    }
}

export default Index;
