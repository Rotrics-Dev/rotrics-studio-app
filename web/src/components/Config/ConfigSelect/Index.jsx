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
                    const style = {fontSize: "12px"};
                    if (item.color) {
                        style.color = item.color;
                    }
                    return (
                        <Select.Option key={item.value}
                                       style={style}
                                       value={item.value}>
                            {item.label}
                        </Select.Option>
                    );
                })}
            </Select>
        );
    }
}

export default Index;
