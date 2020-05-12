import React from 'react';
import {connect} from 'react-redux';
import { actions as hotKeysActions} from '../reducers/hotKeys';
import { actions as laserTextActions} from '../reducers/laserText';
import socketManager from "../socket/socketManager"

class Init extends React.Component {
    componentDidMount() {
        this.props.initHotKeys();
        this.props.initLaserText();
        socketManager.setup();
    }

    render() {
        return null;
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        initHotKeys: () => dispatch(hotKeysActions.init()),
        initLaserText: () => dispatch(laserTextActions.init()),
    };
};

export default connect(null, mapDispatchToProps)(Init);
