import React from 'react';
import {connect} from 'react-redux';

const getSizeDes = (boundingBox) => {
    const {min, max} = boundingBox;
    const width = Math.round(max.x - min.x);
    const height = Math.round(max.y - min.y);
    const depth = Math.round(max.z - min.z);
    return `model size: ${width} x ${height} x ${depth} mm`;
};

class Index extends React.Component {
    render() {
        const {boundingBox, filePath} = this.props;
        if (!boundingBox) {
            return null;
        }
        return (
            <div>
                <p>{getSizeDes(boundingBox)}</p>
                {/*<p>{filePath}</p>*/}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {boundingBox, filePath} = state.p3dModel;
    return {
        boundingBox,
        filePath
    };
};

export default connect(mapStateToProps)(Index);
