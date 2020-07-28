import React, {PureComponent} from 'react';
import {Row, Col} from 'antd';
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import Line from '../../../../components/Line/Index.jsx'
import {actions as writeAndDrawActions} from "../../../../reducers/writeAndDraw";
import {connect} from 'react-redux';
import {ConfigText, ConfigTitle} from "../../../../components/Config";
import {withTranslation} from 'react-i18next';
import Tooltip from '../../../../components/Tooltip/Index.jsx';
import {getUuid} from '../../../../utils';
const tooltipId = getUuid();

class WorkingParameters extends PureComponent {
    actions = {
        setPrintOrder: (value) => {
            this.props.updateWorkingParameters("print_order", value)
        },
        setJogSpeed: (value) => {
            this.props.updateWorkingParameters("jog_speed", value)
        },
        setWorkSpeed: (value) => {
            this.props.updateWorkingParameters("work_speed", value)
        }
    };

    render() {
        const {model, working_parameters, config} = this.props;
        const {t} = this.props;

        if (!model || !working_parameters || !config) {
            return null;
        }
        const actions = this.actions;
        const {work_speed, jog_speed} = working_parameters.children;
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
                    <ConfigTitle text={t(working_parameters.label)}/>
                    <Row
                        data-for={tooltipId}
                        data-tip={t('Determines how fast the front end moves when it’s working.')}>
                        <Col span={19}>
                            <ConfigText text={`${t(work_speed.label)}(${work_speed.unit})`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={work_speed.minimum_value}
                                max={work_speed.maximum_value}
                                value={work_speed.default_value}
                                onAfterChange={actions.setWorkSpeed}/>
                        </Col>
                    </Row>
                    <Row
                        data-for={tooltipId}
                        data-tip={t('Determines how fast the front end moves when it’s working.')}>
                        <Col span={19}>
                            <ConfigText text={`${t(jog_speed.label)}(${jog_speed.unit})`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                min={jog_speed.minimum_value}
                                max={jog_speed.maximum_value}
                                value={jog_speed.default_value}
                                onAfterChange={actions.setJogSpeed}/>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const {model, working_parameters, config} = state.writeAndDraw;
    return {
        model,
        working_parameters,
        config
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateWorkingParameters: (key, value) => dispatch(writeAndDrawActions.updateWorkingParameters(key, value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(WorkingParameters));


