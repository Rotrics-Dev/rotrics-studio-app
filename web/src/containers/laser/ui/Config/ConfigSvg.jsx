import React, {PureComponent} from 'react';
import {Checkbox, Row, Col} from 'antd';
import styles from './styles.css';
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import Line from '../../../../components/Line/Index.jsx'
import {actions as laserActions} from "../../../../reducers/laser";
import {connect} from 'react-redux';
import {ConfigTitle, ConfigText, ConfigSelect} from "../../../../components/Config";
import {withTranslation} from 'react-i18next';
import Tooltip from '../../../../components/Tooltip/Index.jsx';
import {getUuid} from '../../../../utils';

const tooltipId = getUuid();

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
        const {t} = this.props;
        const {model, config} = this.props;
        if (!model || model.fileType !== "svg" || !config) {
            return null;
        }

        const actions = this.actions;
        const {optimize_path, fill} = config.children;
        const {fill_density} = fill.children;
        return (
            <div>
                <Tooltip
                    id={tooltipId}
                    place="left"
                    />
                <Line/>
                <div style={{
                    padding: "8px",
                }}>
                    <ConfigTitle text={t(config.label)}/>
                    <Row
                        data-for={tooltipId}
                        data-tip={t('Optimizes the path based on the proximity of the lines in the image.')}>
                        <Col span={19}>
                            <ConfigText text={`${t(optimize_path.label)}`}/>
                        </Col>
                        <Col span={5}>
                            <Checkbox checked={optimize_path.default_value} onChange={actions.setOptimizePath}/>
                        </Col>
                    </Row>
                    <Row
                        data-for={tooltipId}
                        data-tip={t('Set the degree to which an area is filled with laser dots.')}>
                        <Col span={19}>
                            <ConfigText text={`${t(fill.label)}`}/>
                        </Col>
                        <Col span={5}>
                            <Checkbox checked={fill.default_value} onChange={actions.setFill}/>
                        </Col>
                    </Row>
                    {fill.default_value &&
                    <Row
                        data-for={tooltipId}
                        data-tip={t('Content of the Text.')}>
                        <Col span={17} push={2}>
                            <ConfigText text={`${t(fill_density.label)}`}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ConfigSvg));


