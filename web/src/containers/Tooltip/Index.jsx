import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Tooltip} from 'antd';

class Index extends PureComponent {
    render() {
        const { isTooltipDisplayed, title = '', placement = "left", ...rest} = this.props;
        return (
            <Tooltip
                // color={'#f50'}
                trigger={isTooltipDisplayed ? 'hover' : ''}
                title={title}
                placement={placement}
                {...rest}
            />
        );
    }
}

const mapStateToProps = (state) => {
    const {isTooltipDisplayed} = state.persistentData;
    return {
        isTooltipDisplayed
    };
};

export default connect(mapStateToProps)(Index);


