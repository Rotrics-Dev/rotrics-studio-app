import React, {PureComponent} from 'react';
import {Select} from 'antd';
import laserManager from "../../laser/laserManager.js";
import {toFixed} from '../../../shared/lib/numeric-utils.js';
import styles from './styles.css';
import _ from 'lodash';
import NumberInput from '../../components/NumberInput/Index.jsx';

class Transformation extends PureComponent {
    state = {
        model2d: null,
        transformation: null
    };

    componentDidMount() {
        laserManager.on("onChange", (model2d) => {
            let transformation = model2d ? _.cloneDeep(model2d.settings.transformation) : null;
            this.setState({
                model2d,
                transformation
            })
        });
    }

    actions = {
        setWidth: (value) => {
            laserManager.updateTransformation("width", value)
        },
        setHeight: (value) => {
            laserManager.updateTransformation("height", value)
        },
        setRotationDegree: (value) => {
            laserManager.updateTransformation("rotate", value)
        },
        setX: (value) => {
            laserManager.updateTransformation("x", value)
        },
        setY: (value) => {
            laserManager.updateTransformation("y", value)
        },
        setFlipModel: (value) => {
            laserManager.updateTransformation("flip_model", value)
        },
    };

    render() {
        if (!this.state.model2d) {
            return null;
        }
        const actions = this.actions;
        const {transformation} = this.state;
        const {width, height, rotate, x, y, flip_model} = transformation.children;
        const flipModelOptions = [];
        Object.keys(flip_model.options).forEach((key) => {
            const option = flip_model.options[key];
            flipModelOptions.push(<Select.Option key={key} value={option}>{key}</Select.Option>)
        });
        return (
            <React.Fragment>
                <h2>{transformation.label}</h2>
                <div>
                    <span>{width.label}</span>
                    <span>{"(" + width.unit + ")"}</span>
                    <NumberInput style={{width: 110}}
                           value={toFixed(width.default_value, 0)}
                           onChange={actions.setWidth}/>
                </div>
                <div>
                    <span>{height.label}</span>
                    <span>{"(" + height.unit + ")"}</span>
                    <NumberInput style={{width: 110}}
                                 value={toFixed(height.default_value, 0)}
                                 onChange={actions.setHeight}/>
                </div>
                <div>
                    <span>{rotate.label}</span>
                    <span>{"(" + rotate.unit + ")"}</span>
                    <NumberInput min={rotate.minimum_value} max={rotate.maximum_value}
                                 value={toFixed(rotate.default_value, 0)}
                                 onChange={actions.setRotationDegree}/>
                </div>
                <div>
                    <span>{x.label}</span>
                    <span>{"(" + x.unit + ")"}</span>
                    <NumberInput min={x.minimum_value} max={x.maximum_value} value={toFixed(x.default_value, 0)}
                                 onChange={actions.setX}/>
                </div>
                <div>
                    <span>{y.label}</span>
                    <span>{"(" + y.unit + ")"}</span>
                    <NumberInput min={y.minimum_value} max={y.maximum_value} value={toFixed(y.default_value, 0)}
                                 onChange={actions.setY}/>
                </div>
                <span>{flip_model.label}</span>
                <Select value={flip_model.default_value} style={{width: 110}}
                        onChange={actions.setFlipModel}>
                    {flipModelOptions}
                </Select>
            </React.Fragment>
        );
    }
}

export default Transformation;

