import React from 'react';
import {connect} from 'react-redux';
import { actions } from '../reducers/shortcutKey';

class Init extends React.Component {
    componentDidMount() {
        this.props.initShortcutKey();
    }

    render() {
        return null;
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        initShortcutKey: () => dispatch(actions.init()),
    };
};

export default connect(null, mapDispatchToProps)(Init);
