import React from 'react';
import {connect} from 'react-redux';
import { actions } from '../reducers/hotKeys';

class Init extends React.Component {
    componentDidMount() {
        this.props.initHotKeys();
    }

    render() {
        return null;
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        initHotKeys: () => dispatch(actions.init()),
    };
};

export default connect(null, mapDispatchToProps)(Init);
