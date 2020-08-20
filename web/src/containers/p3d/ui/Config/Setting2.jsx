import React from 'react';
import {Select, Checkbox, Row, Col, Button, Collapse} from 'antd';
import fdmPrinter from "./fdmprinter.def.json";
import NumberInput from '../../../../components/NumberInput/Index.jsx';
import Tooltip from "../../../../components/Tooltip/Index.jsx";
import {getUuid} from "../../../../utils";
import {connect} from 'react-redux';
import {ConfigText, ConfigSelect} from '../../../../components/Config';
import {withTranslation} from 'react-i18next';
import styles from './styles.css';

const tooltipId = getUuid();

const category_basic = ["resolution", "shell", "infill"];
const parameter_basic = [
    "resolution.layer_height", "resolution.layer_height_0",
    "resolution.line_width", "resolution.line_width.wall_line_width.wall_line_width_0", "resolution.line_width.wall_line_width.wall_line_width_x",
    "resolution.layer_height",
    "shell",
    "infill"];

const category_all = [
    "resolution", "shell", "infill", "material", "speed",
    "travel", "cooling", "support", "platform_adhesion",
    "dual", "meshfix", "blackmagic", "experimental"
];
const parameter_all = [];

//only display the following types
const parameterTypesDisplayed = [
    "category",
    // "optional_extruder",
    "float",
    "int",
    "enum",
    "bool",
    // "[int]",
    // "extruder",
    // "str"
];

/**
 * fdmprinter.def.json的结构：settings - category - parent - parent ... parameter
 * @param settings
 * @param displayedCategories  [string], 需要展示的category
 * @param displayedParameters  [string], 需要展示的parameter
 * @param t                    i18n翻译
 * @param updateParameter      更新参数的函数
 * @returns {Array}            渲染好的react elements
 */
const renderSettings = (settings, displayedCategories, displayedParameters, t, updateParameter) => {
    displayedCategories = [
        "resolution", "shell", "infill", "material", "speed",
        "travel", "cooling", "support", "platform_adhesion",
        "dual", "meshfix", "blackmagic", "experimental"
    ];
    displayedParameters = [];

    const convertOptions = (options) => {
        const result = [];
        for (let key in options) {
            result.push({label: t(options[key]), value: key});
        }
        return result;
    };

    /**
     * 将category的children渲染为elements
     * @param children
     * @param categoryKey
     * @param separator 分隔符
     * @returns {Array}
     */
    const renderCategoryChildren = (children, categoryKey, separator, t) => {
        let result = [];
        for (let key in children) {
            let keyChain = categoryKey + separator + key; //例如：resolution.layer_height, resolution.line_width.wall_line_width.wall_line_width_0
            const offset = keyChain.split(separator).length - 2; //随层级缩进
            const child = children[key];
            if (child instanceof Object) {
                if (!parameterTypesDisplayed.includes(child.type)) {
                    continue;
                }
                if (child.children) {
                    let {label, description} = child;
                    result.push(
                        <div key={keyChain}>
                            <Row
                                style={{marginTop: "8px"}}
                                data-for={tooltipId}
                                data-tip={t(description)}
                            >
                                <Col span={24 - offset} offset={offset}>
                                    <ConfigText text={t(label)}/>
                                </Col>
                            </Row>
                        </div>
                    );
                    result = result.concat(renderCategoryChildren(child.children, keyChain, separator, t))
                } else {
                    //叶节点
                    let {label, description, unit, type, default_value, minimum_value, maximum_value, options} = child;
                    if (!minimum_value) {
                        minimum_value = 0;
                    }
                    if (!maximum_value) {
                        maximum_value = 1000;
                    }
                    result.push(
                        <div key={keyChain}>
                            <Row
                                style={{marginTop: "8px"}}
                                data-for={tooltipId}
                                data-tip={t(description)}
                            >
                                <Col span={16 - offset} offset={offset}>
                                    <ConfigText text={t(label)}/>
                                    {unit && <ConfigText text={`(${unit})`}/>}
                                </Col>
                                <Col span={1}/>
                                {type === "float" &&
                                <Col span={7}>
                                    <NumberInput
                                        precision={1}
                                        disabled={false}
                                        min={minimum_value}
                                        max={maximum_value}
                                        value={default_value}
                                        onAfterChange={(value) => {
                                            updateParameter(keyChain, value)
                                        }}
                                    />
                                </Col>
                                }
                                {type === "int" &&
                                <Col span={7}>
                                    <NumberInput
                                        precision={0}
                                        disabled={false}
                                        min={minimum_value}
                                        max={maximum_value}
                                        value={default_value}
                                        onAfterChange={(value) => {
                                            updateParameter(keyChain, value)
                                        }}
                                    />
                                </Col>
                                }
                                {type === "bool" &&
                                <Col span={7}>
                                    <Checkbox
                                        checked={default_value}
                                        onChange={(e) => {
                                            updateParameter(keyChain, e.target.checked)
                                        }}
                                    />
                                </Col>
                                }
                                {type === "enum" &&
                                <Col span={7}>
                                    <ConfigSelect
                                        options={convertOptions(options)}
                                        value={default_value}
                                        onChange={(value) => {
                                            updateParameter(keyChain, value)
                                        }}
                                    />
                                </Col>
                                }
                            </Row>
                        </div>
                    );
                }
            }
        }
        return result;
    };

    const wrapCollapsePanel = (header, icon, elements) => {
        const result = [];
        const extra = <img style={{width: "18px", height: "18px"}} src={require(`./images/${icon}.svg`)}/>
        result.push(
            <Collapse.Panel header={header} key={header} forceRender={true} className={styles.panel} extra={extra}>
                {elements}
            </Collapse.Panel>
        );
        return result;
    };

    const wrapCollapse = (panels) => {
        const result = [];
        result.push(
            <Collapse key="1" accordion={true} expandIconPosition="right">
                {panels}
            </Collapse>
        );
        return result;
    };

    let panels = [];
    for (let key in settings) {
        if (displayedCategories.includes(key)) {
            const category = settings[key];
            const header = t(category.label);
            const icon = category.icon;
            const elements = renderCategoryChildren(category.children, key, ".", t);
            panels = panels.concat(wrapCollapsePanel(header, icon, elements));
        }
    }
    return wrapCollapse(panels);
};

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
        let result = renderSettings(settings, [], [], tCura, actions.updateParameter);
        return (
            <div style={{backgroundColor: "#e0e0e0", width: "100%"}}>
                <Tooltip
                    id={tooltipId}
                    place="left"
                />
                <div>
                    {result}
                </div>
            </div>
        )
    }
}

export default (withTranslation(['cura'])(Index));

