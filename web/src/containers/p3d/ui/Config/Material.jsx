import React, {PureComponent} from 'react';
import {Radio, Row, Col, Button} from 'antd';
import NumberInput from '../../../../components/NumberInput/Index.jsx';

import Line from '../../../../components/Line/Index.jsx'
import {actions as p3dMaterialActions} from "../../../../reducers/p3dMaterial";
import {connect} from 'react-redux';
import {ConfigText} from '../../../../components/Config';
import {withTranslation} from 'react-i18next';
import Tooltip from '../../../../components/Tooltip/Index.jsx';
import {getUuid} from "../../../../utils";
import {renderCategoryChildren, wrapCollapse, wrapCollapsePanel} from "./renderUtils.jsx";
import fdmPrinter from "./fdmprinter.def.json";

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
        updateParameter: (keyChain, value) => {
            console.log(keyChain, value)
        },
        onChange: (e) => {
            console.log(`radio checked:${e.target.value}`);
        }
    };

    render() {
        let {materials, name} = this.props;
        if (!name || materials.length === 0) {
            return null;
        }
        let {t} = this.props;
        const tCura = (key) => {
            return t("cura#" + key);
        };
        const actions = this.actions;

        const {settings} = fdmPrinter;
        const key = "material";
        const category = settings[key];
        const header = tCura(category.label);
        // const icon = category.icon;
        const icon = null;

        const elements4categoryChildren = renderCategoryChildren(category.children, key, ".", tCura, tooltipId, actions.updateParameter);
        const elements4materialRadio =
            <Radio.Group key="2" onChange={actions.onChange} size="small" defaultValue="a">
                <Radio.Button value="a">PLA</Radio.Button>
                <Radio.Button value="b">ABS</Radio.Button>
                <Radio.Button value="c">Custom</Radio.Button>
            </Radio.Group>;
        const elements = [elements4materialRadio, ...elements4categoryChildren];
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





