import React from 'react';
import {connect} from 'react-redux';
import { actions } from '../reducers/hotKeys';
import socketManager from "../socket/socketManager"

class Init extends React.Component {
    componentDidMount() {
        this.props.initHotKeys();
        socketManager.setupSocket();
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
