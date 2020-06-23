import React, {PureComponent} from 'react';
import {Select, Row, Col, Button} from 'antd';
import {toFixed} from '../../../../utils/index.js';
import styles from './styles.css';
import NumberInput from '../../../../components/NumberInput/Index.jsx';

import Line from '../../../../components/Line/Index.jsx'
import {actions as p3dSettingActions} from "../../../../reducers/p3dSetting";
import {connect} from 'react-redux';

const getSettingByName = (settings, name) => {
    for (let i = 0; i < settings.length; i++) {
        const item = settings[i];
        if (item.name === name) {
            return item;
        }
    }
    return null;
};

class Setting extends PureComponent {
    actions = {
        _update: (key, value) => {
            this.props.update(key, value)
        },
        rename: (newName) => {
            console.log("rename: " + newName)
        },
        delete: (name) => {
            console.log("delete: " + name)
        },
        clone: (name) => {
            console.log("clone: " + name)
        },
        select: (name) => {
            this.props.select(name);
        },
        layer_height: (value) => {
            this.actions._update('overrides.layer_height.default_value', value);
        },
        top_thickness: (value) => {
            this.actions._update('overrides.top_thickness.default_value', value);
        },
        infill_sparse_density: (value) => {
            this.actions._update('overrides.infill_sparse_density.default_value', value);
        },
        speed_infill: (value) => {
            this.actions._update('overrides.speed_infill.default_value', value);
        },
        speed_wall_0: (value) => {
            this.actions._update('overrides.speed_wall_0.default_value', value);
        },
        speed_wall_x: (value) => {
            this.actions._update('overrides.speed_wall_x.default_value', value);
        },
        speed_travel: (value) => {
            this.actions._update('overrides.speed_travel.default_value', value);
        },
    };

    render() {
        let {settings, name} = this.props;
        if (!name || settings.length === 0) {
            return null;
        }
        const actions = this.actions;
        const selected = getSettingByName(settings, name);
        const {isOfficial = false, overrides} = selected;
        const {layer_height, top_thickness, infill_sparse_density, speed_infill, speed_wall_0, speed_wall_x, speed_travel} = overrides;

        const settingsButtons = [];
        for (let i = settings.length - 1; i > -1; i--) {
            const item = settings[i];
            settingsButtons.push(<Button key={i} style={{width: "100%"}} type={name === item.name ? 'primary' : ''}
                                         onClick={() => actions.select(item.name)}>{item.label}</Button>)
        }
        return (
            <div>
                <Line/>
                <div style={{
                    padding: "5px",
                }}>
                    {settingsButtons}
                    <Row>
                        <Col span={15}>
                            <span>{layer_height.label}</span>
                            <span>{"(" + layer_height.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput
                                precision={2}
                                disabled={isOfficial}
                                min={layer_height.minimum_value}
                                max={layer_height.maximum_value}
                                value={layer_height.default_value}
                                onAfterChange={actions.layer_height}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={15}>
                            <span>{top_thickness.label}</span>
                            <span>{"(" + top_thickness.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput
                                precision={2}
                                disabled={isOfficial}
                                min={top_thickness.minimum_value}
                                max={top_thickness.maximum_value}
                                value={top_thickness.default_value}
                                onAfterChange={actions.top_thickness}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={15}>
                            <span>{infill_sparse_density.label}</span>
                            <span>{"(" + infill_sparse_density.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput
                                disabled={isOfficial}
                                min={infill_sparse_density.minimum_value}
                                max={infill_sparse_density.maximum_value}
                                value={infill_sparse_density.default_value}
                                onAfterChange={actions.infill_sparse_density}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={15}>
                            <span>{speed_infill.label}</span>
                            <span>{"(" + speed_infill.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput
                                disabled={isOfficial}
                                min={speed_infill.minimum_value}
                                max={speed_infill.maximum_value}
                                value={speed_infill.default_value}
                                onAfterChange={actions.speed_infill}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={15}>
                            <span>{speed_wall_0.label}</span>
                            <span>{"(" + speed_wall_0.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput
                                disabled={isOfficial}
                                min={speed_wall_0.minimum_value}
                                max={speed_wall_0.maximum_value}
                                value={speed_wall_0.default_value}
                                onAfterChange={actions.speed_wall_0}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={15}>
                            <span>{speed_wall_x.label}</span>
                            <span>{"(" + speed_wall_x.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput
                                disabled={isOfficial}
                                min={speed_wall_x.minimum_value}
                                max={speed_wall_x.maximum_value}
                                value={speed_wall_x.default_value}
                                onAfterChange={actions.speed_wall_x}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={15}>
                            <span>{speed_travel.label}</span>
                            <span>{"(" + speed_travel.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput
                                disabled={isOfficial}
                                min={speed_travel.minimum_value}
                                max={speed_travel.maximum_value}
                                value={speed_travel.default_value}
                                onAfterChange={actions.speed_travel}/>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const {settings, name} = state.p3dSetting;
    return {
        settings,
        name
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        update: (key, value) => dispatch(p3dSettingActions.update(key, value)),
        rename: (newName) => dispatch(p3dSettingActions.rename(newName)),
        delete: (name) => dispatch(p3dSettingActions.delete(name)),
        clone: (name) => dispatch(p3dSettingActions.clone(name)),
        select: (name) => dispatch(p3dSettingActions.select(name)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Setting);



