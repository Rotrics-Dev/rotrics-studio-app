import React from 'react';
import styles from './styles.css';
import {Button, Slider, Space, Popover, InputNumber, Checkbox, Tooltip} from 'antd';
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import {actions as p3dModelActions} from "../../../../reducers/p3dModel";
import {connect} from 'react-redux';
import {degree2radian, radian2degree} from '../../../../utils/index.js';
import BetterInputNumber from '../../../../components/BetterInputNumber/Index.jsx'

// 保留小数点后两位
const formatValue = (value) => Number(Number.parseFloat(value).toFixed(2))

class Index extends React.Component {
    state = {
        tap: "", //激活的tap: move/scale/rotate
    };

    actions = {
        
        // 重置
        onReset: () => {
            if (!this.props.model) return
            this.props.updateTransformation("sx", 1)
            this.props.updateTransformation("sy", 1)
            this.props.updateTransformation("sz", 1)
        },
        activateTap: (tap) => {
            this.setState({tap})
        },
        changeX: (value) => {
            this.props.updateTransformation("x", formatValue(value))
        },
        changeY: (value) => {
            this.props.updateTransformation("y", formatValue(value))
        },
        changeZ: (value) => {
            this.props.updateTransformation("z", formatValue(value))
        },
        changeRX: (value) => {
            this.props.updateTransformation("rx", degree2radian(formatValue(value)))
        },
        changeRY: (value) => {
            this.props.updateTransformation("ry", degree2radian(formatValue(value)))
        },
        changeRZ: (value) => {
            this.props.updateTransformation("rz", degree2radian(formatValue(value)))
        },
        changeScale: (value) => {
            this.props.updateTransformation("scale", formatValue(value) / 100)
        },
        changeScaleX: (value) => {
            this.props.updateTransformation("sx", formatValue(value) / 100)
        },
        changeScaleY: (value) => {
            this.props.updateTransformation("sy", formatValue(value) / 100)
        },
        changeScaleZ: (value) => {
            this.props.updateTransformation("sz", formatValue(value) / 100)
        },
        //after change
        afterChangeScale: (value) => {
            this.props.afterUpdateTransformation("scale", formatValue(value) / 100)
        },
        afterChangeScaleX: (value) => {
            this.props.afterUpdateTransformation("sx", formatValue(value) / 100)
        },
        afterChangeScaleY: (value) => {
            this.props.afterUpdateTransformation("sy", formatValue(value) / 100)
        },
        afterChangeScaleZ: (value) => {
            this.props.afterUpdateTransformation("sz", formatValue(value) / 100)
        },
        afterChangeRX: (value) => {
            this.props.afterUpdateTransformation("rx", degree2radian(formatValue(value)))
        },
        afterChangeRY: (value) => {
            this.props.afterUpdateTransformation("ry", degree2radian(formatValue(value)))
        },
        afterChangeRZ: (value) => {
            this.props.afterUpdateTransformation("rz", degree2radian(formatValue(value)))
        },
        // 输入位置
        onXInput: (value) => {
            this.props.updateTransformation("x", formatValue(value))
        },
        onYInput: (value) => {
            this.props.updateTransformation("y", formatValue(value))
        },
        onZInput: (value) => {
            this.props.updateTransformation("z", formatValue(value))
        },

        // 缩放
        onScaleWidthInput: (value) => {
            this.props.updateTransformation('scaleWidth', formatValue(value))
        },
        onScaleHeightInput: (value) => {
            this.props.updateTransformation('scaleHeight', formatValue(value))
        },
        onScaleDepthInput: (value) => {
            this.props.updateTransformation('scaleDepth', formatValue(value))
        },
        toggleIsUniformScaling: () => {
            this.props.updateTransformation('isUniformScaling', (!!!this.props.transformation.isUniformScaling))
        }
    };

    render() {
        const state = this.state;
        const actions = this.actions;

        let {model, transformation} = this.props;
        console.log(transformation)
        // console.log(scaleSize)
        const disabled = !model;
        if (!transformation) {
            transformation = {
                x: 0, 
                y: 0,
                z: 0, 
                rx: 0, 
                ry: 0, 
                rz: 0, 
                scale: 1,
                sx: 1,
                sy: 1,
                sz: 1,
                ogScaleWidth: 0,
                ogScaleHeight: 0,
                ogScaleDepth: 0,
                scaleWidth: 0,
                scaleHeight: 0,
                scaleDepth: 0,
                isUniformScaling: true
            }
        }

        const {x, y, z, scale, sx, sy, sz, scaleWidth, scaleHeight, scaleDepth, ogScaleWidth, ogScaleHeight, ogScaleDepth, isUniformScaling} = transformation;
        const {rx, ry, rz} = transformation;
        const rxDegree = radian2degree(rx);
        const ryDegree = radian2degree(ry);
        const rzDegree = radian2degree(rz);
        console.log()
        const sliderCss = {width: "120px"};
        // 优化 3D打印功能 模型调整操作区

        // 移动
        const content4move = (
            <div>
                <div>
                    <Space direction={"horizontal"}>
                        <span>X</span>
                        <Slider
                            tipFormatter={(value) => {
                                return `${value}mm`
                            }}
                            min={-400}
                            max={400}
                            step={1}
                            value={x}
                            disabled={disabled}
                            style={sliderCss}
                            onChange={actions.changeX}
                        />
                        <BetterInputNumber
                            suffix="mm"
                            size={'small'}
                            min={0}
                            max={400}
                            precision={2}
                            value={x}
                            disabled={disabled}
                            onChange={actions.onXInput}
                        />
                    </Space>
                </div>
                <div>
                    <Space direction={"horizontal"}>
                        <span>Y</span>
                        <Slider
                            tipFormatter={(value) => {
                                return `${value}mm`
                            }}
                            min={0}
                            max={400}
                            step={1}
                            value={y}
                            disabled={disabled}
                            style={sliderCss}
                            onChange={actions.changeY}
                        />
                        <BetterInputNumber
                            suffix="mm"
                            size={'small'}
                            min={0}
                            max={400}
                            precision={2}
                            value={y}
                            disabled={disabled}
                            onChange={actions.onYInput}
                        />
                    </Space>
                </div>
                <div>
                    <Space direction={"horizontal"}>
                        <span>Z</span>
                        <Slider
                            tipFormatter={(value) => {
                                return `${value}mm`
                            }}
                            min={-200}
                            max={200}
                            step={1}
                            value={z}
                            disabled={disabled}
                            style={sliderCss}
                            onChange={actions.changeZ}
                        />
                        <BetterInputNumber
                            suffix="mm"
                            size={'small'}
                            min={0}
                            max={400}
                            precision={2}
                            value={z}
                            disabled={disabled}
                            onChange={actions.onZInput}
                        />
                    </Space>
                </div>
            </div>
        );

        // 缩放
        const content4scale = (
            <div>
                {/* X */}
                <div>
                    <Space direction={"horizontal"}>
                        <span>X</span>
                        <Slider
                            tipFormatter={(value) => {
                                return `${value}%`
                            }}
                            min={10}
                            max={1000}
                            step={1}
                            value={sx * 100}
                            disabled={disabled}
                            style={sliderCss}
                            onChange={actions.changeScaleX}
                            onAfterChange={actions.afterChangeScaleX}
                        />
                        <BetterInputNumber
                            suffix="%"
                            size={'small'}
                            min={0}
                            max={1000}
                            precision={2}
                            value={sx * 100}
                            disabled={disabled}
                            onChange={actions.changeScaleX}
                            onAfterChange={actions.afterChangeScaleX}
                        />
                        {/* mm单位 */}
                        <BetterInputNumber
                            suffix="mm"
                            size={'small'}
                            min={0}
                            max={ogScaleWidth * 10}
                            precision={2}
                            value={scaleWidth}
                            disabled={disabled}
                            onChange={actions.onScaleWidthInput}
                        />
                    </Space>
                </div>
                {/* Y */}
                <div>
                    <Space direction={"horizontal"}>
                        <span>Y</span>
                        <Slider
                            tipFormatter={(value) => {
                                return `${value}%`
                            }}
                            min={10}
                            max={1000}
                            step={1}
                            value={sy * 100}
                            disabled={disabled}
                            style={sliderCss}
                            onChange={actions.changeScaleY}
                            onAfterChange={actions.afterChangeScaleY}
                        />
                        <BetterInputNumber
                            suffix="%"
                            size={'small'}
                            min={0}
                            max={1000}
                            precision={2}
                            value={sy * 100}
                            disabled={disabled}
                            onChange={actions.changeScaleY}
                            onAfterChange={actions.afterChangeScaleY}
                        />
                        {/* mm单位 */}
                        <BetterInputNumber
                            suffix="mm"
                            size={'small'}
                            min={0}
                            max={ogScaleHeight * 10}
                            precision={2}
                            value={scaleHeight}
                            disabled={disabled}
                            onChange={actions.onScaleHeightInput}
                        />
                    </Space>
                </div>
                {/* Z */}
                <div>
                    <Space direction={"horizontal"}>
                        <span>Z</span>
                        <Slider
                            tipFormatter={(value) => {
                                return `${value}%`
                            }}
                            min={10}
                            max={1000}
                            step={1}
                            value={sz * 100}
                            disabled={disabled}
                            style={sliderCss}
                            onChange={actions.changeScaleZ}
                            onAfterChange={actions.afterChangeScaleZ}
                        />
                        <BetterInputNumber
                            suffix="%"
                            size={'small'}
                            min={0}
                            max={1000}
                            precision={2}
                            value={sz * 100}
                            disabled={disabled}
                            onChange={actions.changeScaleZ}
                            onAfterChange={actions.afterChangeScaleZ}
                        />
                        {/* mm单位 */}
                        <BetterInputNumber
                            suffix="mm"
                            size={'small'}
                            min={0}
                            max={ogScaleDepth * 10}
                            precision={2}
                            value={scaleDepth}
                            disabled={disabled}
                            onChange={actions.onScaleDepthInput}
                        />
                    </Space>
                </div>
                {/* 控制 */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '32px'
                }}>
                    <Checkbox 
                        defaultChecked={isUniformScaling}
                        onChange={actions.toggleIsUniformScaling}
                        disabled={disabled}>
                        Uniform Scaling
                    </Checkbox>
                    {/* reset */}
                    <Tooltip placement="top" title="Reset">
                        <div 
                            className={styles.btn_reset}
                            onClick={actions.onReset}>
                            {/* Reset */}
                        </div>
                    </Tooltip>
                </div>
            </div>
        );

        // 旋转
        const content4rotate = (
            <div>
                <div>
                    <Space direction={"horizontal"}>
                        <span>X</span>
                        <Slider
                            tipFormatter={(value) => {
                                return `${value}°`
                            }}
                            min={-180}
                            max={180}
                            step={1}
                            value={rxDegree}
                            disabled={disabled}
                            style={sliderCss}
                            onChange={actions.changeRX}
                            onAfterChange={actions.afterChangeRX}
                        />
                        <BetterInputNumber
                            suffix="°"
                            size={'small'}
                            min={-180}
                            max={180}
                            precision={2}
                            value={rxDegree}
                            disabled={disabled}
                            onChange={actions.changeRX}
                            onAfterChange={actions.afterChangeRX}
                        />
                    </Space>
                </div>
                <div>
                    <Space direction={"horizontal"}>
                        <span>Y</span>
                        <Slider
                            tipFormatter={(value) => {
                                return `${value}°`
                            }}
                            min={-180}
                            max={180}
                            step={1}
                            value={ryDegree}
                            disabled={disabled}
                            style={sliderCss}
                            onChange={actions.changeRY}
                            onAfterChange={actions.afterChangeRY}
                        />
                        <BetterInputNumber
                            suffix="°"
                            size={'small'}
                            min={-180}
                            max={180}
                            precision={2}
                            value={ryDegree}
                            disabled={disabled}
                            onChange={actions.changeRY}
                            onAfterChange={actions.afterChangeRY}
                        />
                    </Space>
                </div>
                <div>
                    <Space direction={"horizontal"}>
                        <span>Z</span>
                        <Slider
                            tipFormatter={(value) => {
                                return `${value}°`
                            }}
                            min={-180}
                            max={180}
                            step={1}
                            value={rzDegree}
                            disabled={disabled}
                            style={sliderCss}
                            onChange={actions.changeRZ}
                            onAfterChange={actions.afterChangeRZ}
                        />
                        <BetterInputNumber
                            suffix="°"
                            size={'small'}
                            min={-180}
                            max={180}
                            precision={2}
                            value={rzDegree}
                            disabled={disabled}
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
    const {model, transformation, scaleSize, originalScaleSize} = state.p3dModel;
    return {
        model,
        transformation,
        scaleSize,
        originalScaleSize
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateTransformation: (key, value) => dispatch(p3dModelActions.updateTransformation(key, value)),
        afterUpdateTransformation: (key, value) => dispatch(p3dModelActions.afterUpdateTransformation(key, value)),
        // 切换缩放
        toggleIsUniformScaling: () => dispatch(p3dModelActions.toggleIsUniformScaling())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);

