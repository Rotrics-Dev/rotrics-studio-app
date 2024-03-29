import React from 'react';
import {connect} from 'react-redux';
import styles from './styles.css';
import {Progress} from 'antd';

class Index extends React.Component {
    state = {};

    render() {
        const {progress = 0, progressTitle = ""} = this.props;
        return (
            <div>
                <p style={{marginLeft: "5px"}}>{progressTitle}</p>
                <Progress style={{position: "absolute", bottom: 0}} percent={progress * 100} showInfo={false}/>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {progress, progressTitle} = state.p3dModel;
    return {
        progress,
        progressTitle
    };
};

export default connect(mapStateToProps)(Index);
