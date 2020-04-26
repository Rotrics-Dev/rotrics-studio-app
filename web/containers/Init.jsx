import React from 'react';
import {connect} from 'react-redux';

class Init extends React.Component {
    componentDidMount() {
    }

    render() {
        return null;
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        initLaser: () => dispatch(),
    };
};

export default connect(null, mapDispatchToProps)(Init);
