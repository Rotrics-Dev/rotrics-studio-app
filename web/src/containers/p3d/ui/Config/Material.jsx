import React, {PureComponent} from 'react';
import {Radio} from 'antd';
import {actions as p3dMaterialActions} from "../../../../reducers/p3dMaterial";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import Tooltip from '../../../Tooltip/Index.jsx';
import {getUuid} from "../../../../utils";
import {renderCategoryChildren, wrapCollapse, wrapCollapsePanel} from "./renderUtils.jsx";

const tooltipId = getUuid();

class Material extends PureComponent {
    actions = {
        updateParameter: (keyChain, value) => {
            console.log(keyChain, value)
            this.props.update(`${keyChain}.default_value`, value);
        },
        onChange: (e) => {
            console.log("onChange: " + e.target.value)
            this.props.select(e.target.value)
        }
    };

    render() {
        const {materials, material} = this.props;
        if (!materials || materials.length === 0 || !material) {
            return null;
        }

        const actions = this.actions;
        const tCura = (key) => {
            return this.props.t("cura#" + key);
        };

        const nameSelected = material.name;
        const elements4Radio =
            <Radio.Group
                style={{margin: "3px 0 0 3px"}}
                key="2"
                size="small"
                defaultValue={nameSelected}
                onChange={actions.onChange}
            >
                {materials.map(item => {
                    const {name} = item;
                    return (
                        <Radio.Button
                            key={name}
                            size="small"
                            checked={nameSelected === name}
                            value={name}>
                            {name}
                        </Radio.Button>
                    );
                })}
            </Radio.Group>;

        const header = tCura(material.material.label);
        const icon = null;
        const categoryKey = "material.children";
        const allowUpdateParameter = !material.isOfficial;
        const elements4categoryChildren = renderCategoryChildren(material.material.children, categoryKey, ".", tCura, tooltipId, actions.updateParameter, allowUpdateParameter);

        const elements = [elements4Radio, ...elements4categoryChildren];
        const panels = wrapCollapsePanel(header, icon, elements);
        const collapse = wrapCollapse(panels);
        return (
            <div>
                <Tooltip
                    id={tooltipId}
                    place="left"
                />
                <div>
                    {collapse}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const {materials, material} = state.p3dMaterial;
    return {
        materials,
        material
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        update: (keyChain, value) => dispatch(p3dMaterialActions.update(keyChain, value)),
        rename: (newName) => dispatch(p3dMaterialActions.rename(newName)),
        delete: (name) => dispatch(p3dMaterialActions.delete(name)),
        clone: (name) => dispatch(p3dMaterialActions.clone(name)),
        select: (name) => dispatch(p3dMaterialActions.select(name)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['cura'])(Material));
