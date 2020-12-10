import React from 'react';
import {connect} from 'react-redux';
import {Progress} from 'antd';

class Index extends React.Component {
    render() {
        const {progress = 0} = this.props;
        return (
            <div>
                <Progress style={{position: "absolute", bottom: 0}} percent={progress * 100} showInfo={false}/>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {progress} = state.p3dModel;
    return {
        progress
    };
};

export default connect(mapStateToProps)(Index);
