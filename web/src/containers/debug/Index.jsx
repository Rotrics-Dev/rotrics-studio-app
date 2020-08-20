import React from 'react';
import { Select } from 'antd';
import styles from './TestPage.less';
const Option = Select.Option;

const children = [];
for (let i = 10; i < 36; i++) {
    children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}

class Index extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Select
                mode="multiple"
                style={{ width: 300 }}
                placeholder="Please select"
                className={styles.customSelect}
            >
                {children}
            </Select>
        )
    }
}

export default (Index);

