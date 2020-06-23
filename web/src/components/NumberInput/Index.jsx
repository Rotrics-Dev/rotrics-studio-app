import React, {PureComponent} from 'react';
import {InputNumber} from 'antd';

const getAvailableValue = (e) => {
    //获取到的是string
    const min = parseInt(e.target.min);
    const max = parseInt(e.target.max);
    let value = parseFloat(e.target.value);
    if (value > max) {
        value = max;
    } else if (value < min) {
        value = min;
    }
    return value;
};

class Index extends PureComponent {
    actions = {
        onPressEnter: (e) => {
            //移除焦点后，才会正确的value
            e.target.blur();
        },
        onBlur: (e) => {
            const value = getAvailableValue(e);
            this.props.onAfterChange && this.props.onAfterChange(value);
        },
    };

    render() {
        // required props: onAfterChange, value
        // https://ant.design/components/input-number-cn/
        const {max = 999999, min = -99999, value = 0, precision = 0, ...rest} = this.props;
        const actions = this.actions;
        return (
            <InputNumber
                {...rest}
                min={min}
                max={max}
                value={value}
                precision={precision}
                size="small"
                onPressEnter={actions.onPressEnter}
                onBlur={actions.onBlur}
            />
        );
    }
}

export default Index;
