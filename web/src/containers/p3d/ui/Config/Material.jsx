import React, {PureComponent} from 'react';
import {Select, Row, Col, Button} from 'antd';
import styles from './styles.css';
import NumberInput from '../../../../components/NumberInput/Index.jsx';

import Line from '../../../../components/Line/Index.jsx'
import {actions as p3dMaterialActions} from "../../../../reducers/p3dMaterial";
import {connect} from 'react-redux';
import {ConfigText} from '../../../../components/Config';
import {withTranslation} from 'react-i18next';
import Tooltip from '../../../../components/Tooltip/Index.jsx';
import {getUuid} from "../../../../utils";

const tooltipId = getUuid();

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
        let {t} = this.props;
        const tCura = (key) => {
            return t("cura:" + key)
        };
        const actions = this.actions;
        const selected = getMaterialByName(materials, name);
        const {isOfficial = false, overrides} = selected;
        const {material_diameter, material_flow, material_print_temperature, material_print_temperature_layer_0, material_final_print_temperature} = overrides;
        const materialEles = [];
        for (let i = materials.length - 1; i > -1; i--) {
            const item = materials[i];
            materialEles.push(<Button key={i} size="small" style={{width: "50%", fontSize: "13px"}}
                                      type={name === item.name ? 'primary' : ''}
                                      onClick={() => actions.select(item.name)}>{t("common:" + item.label)}</Button>)
        }
        return (
            <div>
                <Tooltip
                    id={tooltipId}
                    place="left"
                />
                <Line/>
                <div style={{
                    padding: "8px"
                }}>
                    {materialEles}
                    <Row
                        style={{marginTop: "8px"}}
                        data-for={tooltipId}
                        data-tip={tCura(material_diameter.description)}
                    >
                        <Col span={19}>
                            <ConfigText text={tCura(material_diameter.label)}/>
                            <ConfigText text={`(${material_diameter.unit})`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                precision={2}
                                disabled={true}
                                min={material_diameter.minimum_value}
                                max={material_diameter.maximum_value}
                                value={material_diameter.default_value}
                            />
                        </Col>
                    </Row>
                    <Row
                        data-for={tooltipId}
                        data-tip={tCura(material_flow.description)}
                    >
                        <Col span={19}>
                            <ConfigText text={tCura(material_flow.label)}/>
                            <ConfigText text={`(${material_flow.unit})`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                disabled={isOfficial}
                                min={material_flow.minimum_value}
                                max={material_flow.maximum_value}
                                value={material_flow.default_value}
                                onAfterChange={actions.material_flow}/>
                        </Col>
                    </Row>
                    <Row
                        data-for={tooltipId}
                        data-tip={tCura(material_print_temperature.description)}
                    >
                        <Col span={19}>
                            <ConfigText text={tCura(material_print_temperature.label)}/>
                            <ConfigText text={`(${material_print_temperature.unit})`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                disabled={isOfficial}
                                min={material_print_temperature.minimum_value}
                                max={material_print_temperature.maximum_value}
                                value={material_print_temperature.default_value}
                                onAfterChange={actions.material_print_temperature}/>
                        </Col>
                    </Row>
                    <Row
                        data-for={tooltipId}
                        data-tip={tCura(material_print_temperature_layer_0.description)}
                    >
                        <Col span={19}>
                            <ConfigText text={tCura(material_print_temperature_layer_0.label)}/>
                            <ConfigText text={`(${material_print_temperature_layer_0.unit})`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                disabled={isOfficial}
                                min={material_print_temperature_layer_0.minimum_value}
                                max={material_print_temperature_layer_0.maximum_value}
                                value={material_print_temperature_layer_0.default_value}
                                onAfterChange={actions.material_print_temperature_layer_0}/>
                        </Col>
                    </Row>
                    <Row
                        data-for={tooltipId}
                        data-tip={tCura(material_final_print_temperature.description)}
                    >
                        <Col span={19}>
                            <ConfigText text={tCura(material_final_print_temperature.label)}/>
                            <ConfigText text={`(${material_final_print_temperature.unit})`}/>
                        </Col>
                        <Col span={5}>
                            <NumberInput
                                disabled={isOfficial}
                                min={material_final_print_temperature.minimum_value}
                                max={material_final_print_temperature.maximum_value}
                                value={material_final_print_temperature.default_value}
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['cura'])(Material));





