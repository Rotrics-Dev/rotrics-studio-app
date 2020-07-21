import React, {PureComponent} from 'react';
import {Select} from 'antd';

class Index extends PureComponent {
    render() {
        const {value, options, onChange, ...rest} = this.props;
        return (
            <Select
                size="small"
                value={value}
                onChange={onChange}
                style={{width: "100%", fontSize: "12px"}}
                {...rest}
            >
                {options.map(item => {
                    return (
                        <Select.Option key={item.value} style={{fontSize: "12px"}}
                                       value={item.value}>{item.label}</Select.Option>
                    );
                })}
            </Select>
        );
    }
}

export default Index;
