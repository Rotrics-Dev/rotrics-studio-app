import React from 'react';
import styles from './styles.css';
import {Button, Slider, Space, Popover} from 'antd';
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import {actions as p3dModelActions} from "../../../../reducers/p3dModel";
import {connect} from 'react-redux';
import {degree2radian, radian2degree} from '../../../../utils/index.js';

class Index extends React.Component {
    state = {
        tap: "", //激活的tap: move/scale/rotate
    };

    actions = {
        activateTap: (tap) => {
            this.setState({tap})
        },
        changeX: (value) => {
            this.props.updateTransformation("x", value)
        },
        changeY: (value) => {
            this.props.updateTransformation("y", value)
        },
        changeRX: (value) => {
            this.props.updateTransformation("rx", degree2radian(value))
        },
        changeRY: (value) => {
            this.props.updateTransformation("ry", degree2radian(value))
        },
        changeRZ: (value) => {
            this.props.updateTransformation("rz", degree2radian(value))
        },
        changeScale: (value) => {
            this.props.updateTransformation("scale", value / 100)
        },
        //after change
        afterChangeScale: (value) => {
            this.props.afterUpdateTransformation("scale", value / 100)
        },
        afterChangeRX: (value) => {
            this.props.afterUpdateTransformation("rx", degree2radian(value))
        },
        afterChangeRY: (value) => {
            this.props.afterUpdateTransformation("ry", degree2radian(value))
        },
        afterChangeRZ: (value) => {
            this.props.afterUpdateTransformation("rz", degree2radian(value))
        },
    };

    render() {
        const state = this.state;
        const actions = this.actions;

        let {model, transformation} = this.props;
        const disabled = !model;
        if (!transformation) {
            transformation = {x: 0, y: 0, rx: 0, ry: 0, rz: 0, scale: 1}
        }

        const {x, y, scale} = transformation;
        const {rx, ry, rz} = transformation;
        const rxDegree = radian2degree(rx);
        const ryDegree = radian2degree(ry);
        const rzDegree = radian2degree(rz);
        console.log()
        const sliderCss = {width: "120px"};
        const content4move = (
            <div>
                <div>
                    <Space direction={"horizontal"}>
                        <span>X</span>
                        <Slider
                            min={-400}
                            max={400}
                            step={1}
                            value={x}
                            disabled={disabled}
                            style={sliderCss}
                            onChange={actions.changeX}
                        />
                    </Space>
                </div>
                <div>
                    <Space direction={"horizontal"}>
                        <span>Y</span>
                        <Slider
                            min={0}
                            max={400}
                            step={1}
                            value={y}
                            disabled={disabled}
                            style={sliderCss}
                            onChange={actions.changeY}
                        />
                    </Space>
                </div>
            </div>
        );
        const content4scale = (
            <div>
                <Slider
                    tipFormatter={(value) => {
                        return `${value}%`
                    }}
                    min={10}
                    max={1000}
                    step={1}
                    value={scale * 100}
                    disabled={disabled}
                    style={sliderCss}
                    onChange={actions.changeScale}
                    onAfterChange={actions.afterChangeScale}
                />
            </div>
        );
        const content4rotate = (
            <div>
                <div>
                    <Space direction={"horizontal"}>
                        <span>X</span>
                        <Slider
                            min={-180}
                            max={180}
                            step={1}
                            value={rxDegree}
                            disabled={disabled}
                            style={sliderCss}
                            onChange={actions.changeRX}
                            onAfterChange={actions.afterChangeRX}
                        />
                    </Space>
                </div>
                <div>
                    <Space direction={"horizontal"}>
                        <span>Y</span>
                        <Slider
                            min={-180}
                            max={180}
                            step={1}
                            value={ryDegree}
                            disabled={disabled}
                            style={sliderCss}
                            onChange={actions.changeRY}
                            onAfterChange={actions.afterChangeRY}
                        />
                    </Space>
                </div>
                <div>
                    <Space direction={"horizontal"}>
                        <span>Z</span>
                        <Slider
                            min={-180}
                            max={180}
                            step={1}
                            value={rzDegree}
                            disabled={disabled}
                            style={sliderCss}
                            onChange={actions.changeRZ}
                            onAfterChange={actions.afterChangeRZ}
                        />
                    </Space>
                </div>
            </div>
        );

        return (
            <div>
                <Space direction={"vertical"} size={0}>
                    <Popover placement="right" content={content4move} trigger="click">
                        <button
                            disabled={disabled}
                            onClick={() => actions.activateTap('move')}
                            className={styles.btn_move}
                        />
                    </Popover>
                    <Popover placement="right" content={content4scale} trigger="click">
                        <button
                            disabled={disabled}
                            onClick={() => actions.activateTap('scale')}
                            className={styles.btn_scale}
                        />
                    </Popover>
                    <Popover placement="right" content={content4rotate} trigger="click">
                        <button
                            disabled={disabled}
                            onClick={() => actions.activateTap('rotate')}
                            className={styles.btn_rotate}
                        />
                    </Popover>
                </Space>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {model, transformation} = state.p3dModel;
    return {
        model,
        transformation
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateTransformation: (key, value) => dispatch(p3dModelActions.updateTransformation(key, value)),
        afterUpdateTransformation: (key, value) => dispatch(p3dModelActions.afterUpdateTransformation(key, value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);

