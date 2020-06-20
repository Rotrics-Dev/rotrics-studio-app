import React, {PureComponent} from 'react';
import {InputNumber} from 'antd';

class Index extends PureComponent {
    actions = {
        onAfterChange: (e) => {
            //获取到的是string
            const min = parseInt(e.target.min);
            const max = parseInt(e.target.max);
            let value = parseFloat(e.target.value);
            if (value > max) {
                value = max;
            } else if (value < min) {
                value = min;
            }
            this.props.onAfterChange(value);
            //移除焦点后，才会正确的value
            e.target.blur();
        }
    };

    render() {
        // required props: onAfterChange, value
        // https://ant.design/components/input-number-cn/
        const {max = 999999, min = -99999, value = 0, ...rest} = this.props;
        const actions = this.actions;
        return (
            <InputNumber
                {...rest}
                max={max}
                min={min}
                size="small"
                value={value}
                onPressEnter={actions.onAfterChange}
                onBlur={actions.onAfterChange}
            />
        );
    }
}

export default Index;
