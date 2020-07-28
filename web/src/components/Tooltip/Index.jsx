import React, {PureComponent} from 'react';
import ReactTooltip from "react-tooltip";
import styles from './styles.css';

class Index extends PureComponent {
    render() {
        const {...rest} = this.props;
        return (
            <ReactTooltip
                className={styles.style_default}
                type="info"
                effect="solid"
                backgroundColor="#c0c0c0"
                textColor="#292421"
                multiline={true}
                getContent={this.getContent}
                delayShow={200}
                html={true}
                {...rest}/>
        );
    }
}

export default Index;
