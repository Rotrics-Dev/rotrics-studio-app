import React from 'react';
import {connect} from 'react-redux';
import {actions} from '../reducers/laser';

class Init extends React.Component {
    componentDidMount() {
        this.props.initLaser();
    }

    render() {
        return null;
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        initLaser: () => dispatch(actions.init()),
    };
};

export default connect(null, mapDispatchToProps)(Init);
