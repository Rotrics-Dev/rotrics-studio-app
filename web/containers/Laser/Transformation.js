import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {InputNumber, Slider} from 'antd';
import laserManager from "../../manager/laserManager.js";
import {toFixed, radian2degree, degree2radian} from '../../lib/numeric-utils';

const MIN_WIDTH = 5;
const MIN_HEIGHT = 5;

class Transformation extends PureComponent {
    actions = {
        setWidth: (value) => {
            value = (value < MIN_WIDTH) ? MIN_WIDTH : value;
            laserManager.setWidth(value)
        },
        setHeight: (value) => {
            value = (value < MIN_HEIGHT) ? MIN_HEIGHT : value;
            laserManager.setHeight(value)
        },
        setRotationDegree: (value) => {
            laserManager.setRotation(degree2radian(value))
        },
        setX: (value) => {
            laserManager.setX(value)
        },
        setY: (value) => {
            laserManager.setY(value)
        },
    };

    render() {
        const {model2d, width, height, x, y, rotationDegree} = this.props;
        const actions = this.actions;
        if (!model2d) {
            return null;
        }

        return (
            <React.Fragment>
                <div>
                    <span>{('Size (mm)  ')}</span>
                    <InputNumber style={{width: "75px"}} min={MIN_WIDTH} max={200} value={width}
                                 onChange={actions.setWidth}/>
                    <span>{(' X ')}</span>
                    <InputNumber style={{width: "75px"}} min={MIN_HEIGHT} max={200} value={height}
                                 onChange={actions.setHeight}/>
                </div>
                <div>
                    <span>{('Rotate(deg)  ')}</span>
                    <Slider style={{width: "75px", display: "inline-block"}} min={-180} max={180} value={rotationDegree}
                            onChange={actions.setRotationDegree}/>
                    <InputNumber style={{width: "70px"}} min={-180} max={180} value={rotationDegree}
                                 onChange={actions.setRotationDegree}/>
                </div>
                <div>
                    <span>{('Move X  ')}</span>
                    <Slider style={{width: "95px", display: "inline-block"}} min={-100} max={100} value={x}
                            onChange={actions.setX}/>
                    <InputNumber style={{width: "70px"}} min={-100} max={100} onChange={actions.setX} value={x}/>
                </div>
                <div>
                    <span>{('Move Y  ')}</span>
                    <Slider style={{width: "95px", display: "inline-block"}} min={-100} max={100} value={y}
                            onChange={actions.setY}/>
                    <InputNumber style={{width: "70px"}} min={-100} max={100} onChange={actions.setY} value={y}/>
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const {model2d, width, height, x, y, rotation} = state.laser;
    const rotationDegree = radian2degree(rotation);
    return {
        model2d,
        width: toFixed(width, 0),
        height: toFixed(height, 0),
        x: toFixed(x, 0),
        y: toFixed(y, 0),
        rotationDegree: toFixed(rotationDegree, 0),
    };
};

export default connect(mapStateToProps)(Transformation);

