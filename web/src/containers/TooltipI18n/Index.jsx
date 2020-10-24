import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Tooltip} from 'antd';
import {withTranslation} from 'react-i18next';

class Index extends PureComponent {
    render() {
        const {t, isTooltipDisplayed, title = '', ...rest} = this.props;
        return (
            <Tooltip trigger={isTooltipDisplayed? 'hover': ''}  title={t(title)} {...rest}/>
        );
    }
}

const mapStateToProps = (state) => {
    const {isTooltipDisplayed} = state.persistentData;
    return {
        isTooltipDisplayed
    };
};

export default connect(mapStateToProps)(withTranslation()(Index));


