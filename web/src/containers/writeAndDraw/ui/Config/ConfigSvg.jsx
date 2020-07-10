import React, {PureComponent} from 'react';
import {Checkbox, Row, Col} from 'antd';
import styles from './styles.css';
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import Line from '../../../../components/Line/Index.jsx'
import {actions as writeAndDrawActions} from "../../../../reducers/writeAndDraw";
import {connect} from 'react-redux';
import {ConfigTitle, ConfigText, ConfigSelect} from "../../../../components/Config";

class ConfigSvg extends PureComponent {
    actions = {
        setOptimizePath: (e) => {
            this.props.updateConfig("optimize_path", e.target.checked)
        },
        setFill: (e) => {
            this.props.updateConfig("fill", e.target.checked)
        },
        setFillDensity: (value) => {
            this.props.updateConfig("fill.fill_density", value)
        },
    };

    render() {
        const {model, config} = this.props;
        if (!model || model.fileType !== "svg" || !config) {
            return null;
        }

        const actions = this.actions;
        const {optimize_path, fill} = config.children;
        const {fill_density} = fill.children;
        return (
            <div>
                <Line/>
                <div style={{
                    padding: "8px",
                }}>
                    <ConfigTitle text={config.label}/>
                    <Row>
                        <Col span={19}>
                            <ConfigText text={`${optimize_path.label}`}/>
                        </Col>
                        <Col span={5}>
                            <Checkbox checked={optimize_path.default_value} onChange={actions.setOptimizePath}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={19}>
                            <ConfigText text={`${fill.label}`}/>
                        </Col>
                        <Col span={5}>
                            <Checkbox checked={fill.default_value} onChange={actions.setFill}/>
                        </Col>
                    </Row>
                    {fill.default_value &&
                    <Row>
                        <Col span={17} push={2}>
                            <ConfigText text={`${fill_density.label}`}/>
                        </Col>
                        <Col span={5} push={2}>
                            <NumberInput
                                min={fill_density.minimum_value}
                                max={fill_density.maximum_value}
                                value={fill_density.default_value}
                                onAfterChange={actions.setFillDensity}/>
                        </Col>
                    </Row>
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const {model, config} = state.writeAndDraw;
    return {
        model,
        config
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateConfig: (key, value) => dispatch(writeAndDrawActions.updateConfig(key, value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigSvg);


