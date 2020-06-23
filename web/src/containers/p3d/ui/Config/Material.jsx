import React, {PureComponent} from 'react';
import {Select, Row, Col, Button} from 'antd';
import {toFixed} from '../../../../utils/index.js';
import styles from './styles.css';
import NumberInput from '../../../../components/NumberInput/Index.jsx';

import Line from '../../../../components/Line/Index.jsx'
import {actions as p3dMaterialActions} from "../../../../reducers/p3dMaterial";
import {connect} from 'react-redux';

const getMaterialByName = (materials, name) => {
    for (let i = 0; i < materials.length; i++) {
        const item = materials[i];
        if (item.name === name) {
            return item;
        }
    }
    return null;
};

class Material extends PureComponent {
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
        material_flow: (value) => {
            this.actions._update('overrides.material_flow.default_value', value);
        },
        material_print_temperature: (value) => {
            this.actions._update('overrides.material_print_temperature.default_value', value);
        },
        material_print_temperature_layer_0: (value) => {
            this.actions._update('overrides.material_print_temperature_layer_0.default_value', value);
        },
        material_final_print_temperature: (value) => {
            this.actions._update('overrides.material_final_print_temperature.default_value', value);
        },
    };

    render() {
        let {materials, name} = this.props;
        if (!name || materials.length === 0) {
            return null;
        }
        const actions = this.actions;
        const selected = getMaterialByName(materials, name);
        const {isOfficial = false, overrides} = selected;
        const {material_diameter, material_flow, material_print_temperature, material_print_temperature_layer_0, material_final_print_temperature} = overrides;
        const materialEles = [];
        for (let i = materials.length - 1; i > -1; i--) {
            const item = materials[i];
            materialEles.push(<Button key={i} type={name === item.name ? 'primary' : ''}
                                      onClick={() => actions.select(item.name)}>{item.name}</Button>)
        }
        return (
            <div>
                <Line/>
                <div style={{
                    padding: "5px",
                }}>
                    {materialEles}
                    <Row>
                        <Col span={15}>
                            <span>{material_diameter.label}</span>
                            <span>{"(" + material_diameter.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput
                                disabled={true}
                                value={material_diameter.default_value}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={15}>
                            <span>{material_flow.label}</span>
                            <span>{"(" + material_flow.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput
                                disabled={isOfficial}
                                value={toFixed(material_flow.default_value, 0)}
                                onAfterChange={actions.material_flow}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={15}>
                            <span>{material_print_temperature.label}</span>
                            <span>{"(" + material_print_temperature.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput
                                disabled={isOfficial}
                                value={toFixed(material_print_temperature.default_value, 0)}
                                onAfterChange={actions.material_print_temperature}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={15}>
                            <span>{material_print_temperature_layer_0.label}</span>
                            <span>{"(" + material_print_temperature_layer_0.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput disabled={isOfficial}
                                         value={toFixed(material_print_temperature_layer_0.default_value, 0)}
                                         onAfterChange={actions.material_print_temperature_layer_0}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={15}>
                            <span>{material_final_print_temperature.label}</span>
                            <span>{"(" + material_final_print_temperature.unit + ")"}</span>
                        </Col>
                        <Col span={9}>
                            <NumberInput disabled={isOfficial}
                                         value={toFixed(material_final_print_temperature.default_value, 0)}
                                         onAfterChange={actions.material_final_print_temperature}/>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const {materials, name} = state.p3dMaterial;
    return {
        materials,
        name
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        update: (key, value) => dispatch(p3dMaterialActions.update(key, value)),
        rename: (newName) => dispatch(p3dMaterialActions.rename(newName)),
        delete: (name) => dispatch(p3dMaterialActions.delete(name)),
        clone: (name) => dispatch(p3dMaterialActions.clone(name)),
        select: (name) => dispatch(p3dMaterialActions.select(name)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Material);



