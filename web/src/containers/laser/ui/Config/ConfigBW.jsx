import React, {PureComponent} from 'react';
import {Checkbox, Select, Space, Row, Col, Divider} from 'antd';
import styles from './styles.css';
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import Line from '../../../../components/Line/Index.jsx'
import {actions as laserActions} from "../../../../reducers/laser";
import {connect} from 'react-redux';
import {ConfigTitle, ConfigText, ConfigSelect} from "../../../../components/Config";
import {withTranslation} from 'react-i18next';
import ReactTooltip from "react-tooltip";
import {getUuid} from '../../../../utils';

const tooltipId = getUuid();

class ConfigBW extends PureComponent {
    actions = {
        setInvert: (e) => {
            this.props.updateConfig("invert", e.target.checked)
        },
        setBW: (value) => {
            this.props.updateConfig("bw", value)
        },
        setDensity: (value) => {
            this.props.updateConfig("density", value)
        },
        setLineDirection: (value) => {
            this.props.updateConfig("line_direction", value)
        }
    };

    render() {
        const {t} = this.props;
        const {model, config} = this.props;
        if (!model || model.fileType !== "bw" || !config) {
            return null;
        }
        const actions = this.actions;
        const {invert, bw, line_direction, density} = config.children;

        const directionOptions = [];
        Object.keys(line_direction.options).forEach((key) => {
            const option = line_direction.options[key];
            directionOptions.push({label: key, value: option})
        });
        return (
            <div>
                <ReactTooltip
                    id={tooltipId}
                    place="left"
                    type="info"
                    effect="solid"
                    backgroundColor="#c0c0c0"
                    textColor="#292421"
                    delayShow={200}/>
                <Line/>
                <div style={{
                    padding: "8px",
                }}>
                    <ConfigTitle text={t(config.label)}/>
                    <Row
                        data-for={tooltipId}
                        data-tip={t(invert.description)}>
                        <Col span={19}>
                            <ConfigText text={`${t(invert.label)}`}/>
                        </Col>
                        <Col span={5}>
                            <Checkbox checked={invert.default_value} onChange={actions.setInvert}/>
                        </Col>
                    </Row>
                    <Row
                        data-for={tooltipId}
                        data-tip={t(bw.description)}>
                        <Col span={19}>
                            <ConfigText text={`${t(bw.label)}`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={bw.minimum_value}
                                max={bw.maximum_value}
                                value={bw.default_value}
                                onAfterChange={actions.setBW}/>
                        </Col>
                    </Row>
                    <Row
                        data-for={tooltipId}
                        data-tip={t(density.description)}>
                        <Col span={19}>
                            <ConfigText text={`${t(density.label)}(${density.unit})`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={density.minimum_value}
                                max={density.maximum_value}
                                value={density.default_value}
                                onAfterChange={actions.setDensity}/>
                        </Col>
                    </Row>
                    <Row
                        data-for={tooltipId}
                        data-tip={t(line_direction.description)}>
                        <Col span={15}>
                            <ConfigText text={`${t(line_direction.label)}`}/>
                        </Col>
                        <Col span={9}>
                            <ConfigSelect options={directionOptions} value={line_direction.default_value}
                                          onChange={actions.setLineDirection}/>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const {model, config} = state.laser;
    return {
        model,
        config
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateConfig: (key, value) => dispatch(laserActions.updateConfig(key, value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ConfigBW));


