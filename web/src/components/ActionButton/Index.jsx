import React, {PureComponent} from 'react';
import {Button} from 'antd';
import styles from './styles.css';

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
                {text}
            </Button>
        );
    }
}

export default Index;
