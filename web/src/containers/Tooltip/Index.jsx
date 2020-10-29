import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Tooltip} from 'antd';

class Index extends PureComponent {
    render() {
        const {is_show_tip, title = '', placement = "left", ...rest} = this.props;
        return (
            <Tooltip
                // color={'#f50'}
                trigger={is_show_tip ? 'hover' : ''}
                title={title}
                placement={placement}
                {...rest}
            />
        );
    }
}

const mapStateToProps = (state) => {
    const {is_show_tip} = state.appConfig;
    return {
        is_show_tip
    };
};

export default connect(mapStateToProps)(Index);


