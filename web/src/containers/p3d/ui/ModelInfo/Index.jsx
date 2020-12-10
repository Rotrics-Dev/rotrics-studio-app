import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';

class Index extends React.Component {
    render() {
        const {t, boundingBox, filePath} = this.props;
        const getSizeDes = (boundingBox) => {
            const {min, max} = boundingBox;
            const width = Math.round(max.x - min.x);
            const height = Math.round(max.y - min.y);
            const depth = Math.round(max.z - min.z);
            return `${t('model size')}: ${width} x ${height} x ${depth} mm`;
        };
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

export default connect(mapStateToProps)(withTranslation()(Index));

