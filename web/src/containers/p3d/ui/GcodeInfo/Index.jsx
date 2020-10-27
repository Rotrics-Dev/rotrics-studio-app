import React from 'react';
import {connect} from 'react-redux';

//printTime单位是s
const getPrintTimeDes = (printTime) => {
    const hours = Math.floor(printTime / 3600);
    const minutes = Math.ceil((printTime - hours * 3600) / 60);
    return (hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`);
};

class Index extends React.Component {
    render() {
        const {printTime, filamentLength, filamentWeight} = this.props;
        if (printTime * filamentLength * filamentWeight === 0) {
            return null;
        }
        return (
            <div>
                <p style={{
                    position: "absolute",
                    right: "5px"
                }}>{`${filamentLength.toFixed(1)}m/${filamentWeight.toFixed(1)}g`}</p>
                <p style={{position: "absolute", right: "5px", top: "20px"}}>{getPrintTimeDes(printTime)}</p>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {printTime, filamentLength, filamentWeight} = state.p3dModel;
    return {
        filamentLength,
        filamentWeight,
        printTime,
    };
};

export default connect(mapStateToProps)(Index);
