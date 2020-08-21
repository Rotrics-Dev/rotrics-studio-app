import React from 'react';
import {Radio, Checkbox, Row, Col, Button, Collapse} from 'antd';
import fdmPrinter from "./fdmprinter.def.json";
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import Tooltip from '../../../Tooltip/Index.jsx';
import {getUuid} from "../../../../utils";
import {connect} from 'react-redux';
import {ConfigText, ConfigSelect} from '../../../../components/Config';
import {withTranslation} from 'react-i18next';
import styles from './styles.css';
import {renderCategoryChildren, wrapCollapse, wrapCollapsePanel} from "./renderUtils.jsx";

const tooltipId = getUuid();

const category_basic = ["resolution", "shell", "infill"];
const parameter_basic = [
    "resolution.layer_height", "resolution.layer_height_0",
    "resolution.line_width", "resolution.line_width.wall_line_width.wall_line_width_0", "resolution.line_width.wall_line_width.wall_line_width_x",
    "resolution.layer_height",
    "shell",
    "infill"];

const category_all = [
    "resolution",
    "shell",
    "infill",
    // "material",
    "speed",
    "travel",
    "cooling",
    "support",
    "platform_adhesion",
    "dual",
    "meshfix",
    "blackmagic",
    "experimental"
];
const parameter_all = [];

const displayedCategories = category_all;

class Index extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    actions = {
        updateParameter: (keyChain, value) => {
            console.log(keyChain, value)
        },
    };

    render() {
        const actions = this.actions;
        let {t} = this.props;
        const tCura = (key) => {
            return t("cura#" + key);
        };

        const {settings} = fdmPrinter;
        let panels = [];
        for (let key in settings) {
            if (displayedCategories.includes(key)) {
                const category = settings[key];
                const header = tCura(category.label);
                const icon = category.icon;
                const elements = renderCategoryChildren(category.children, key, ".", tCura, tooltipId, actions.updateParameter);
                panels = panels.concat(wrapCollapsePanel(header, icon, elements));
            }
        }
        const collapse = wrapCollapse(panels);

        return (
            <div style={{backgroundColor: "#e0e0e0", width: "100%"}}>
                <Tooltip
                    id={tooltipId}
                    place="left"
                />
                <Collapse expandIconPosition="right">
                    <Collapse.Panel

                        key="1"
                        header="Printing Settings"
                        style={{
                            fontSize: "13px",
                            background: "#eeeeee"
                        }}>
                        <Radio.Group key="2" onChange={actions.onChange} size="small" defaultValue="a">
                            <Radio.Button value="a">PLA</Radio.Button>
                            <Radio.Button value="b">ABS</Radio.Button>
                            <Radio.Button value="c">Custom</Radio.Button>
                        </Radio.Group>
                        {collapse}
                    </Collapse.Panel>
                </Collapse>
            </div>
        )
    }
}

export default (withTranslation(['cura'])(Index));

