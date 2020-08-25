import React from 'react';
import {Checkbox, Row, Col, Collapse} from 'antd';
import {ConfigText, ConfigSelect} from '../../../../components/Config';
import NumberInput from '../../../../components/NumberInput/Index.jsx';

//only display the following types
const PARAMETER_TYPES_DISPLAYED = [
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

const convertOptions = (options, t) => {
    const result = [];
    for (let key in options) {
        result.push({label: t(options[key]), value: key});
    }
    return result;
};

/**
 * 将category的children渲染为react elements
 * @param children         category的children
 * @param categoryKey      category的key
 * @param t                i18n
 * @param tooltipId
 * @param updateParameterFunc  function
 * @param allowUpdateParameter bool: 是否允许修改parameter
 * @returns {Array}
 */
const renderCategoryChildren = (children, categoryKey, t, tooltipId, updateParameterFunc, allowUpdateParameter = false) => {
    let result = [];
    for (let key in children) {
        let keyChain = `${categoryKey}.${key}`; //example：resolution.layer_height, resolution.line_width.wall_line_width.wall_line_width_0
        const offset = keyChain.split(".").length - 2; //随层级缩进
        const child = children[key];
        if (child instanceof Object) {
            if (!PARAMETER_TYPES_DISPLAYED.includes(child.type)) {
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
                result = result.concat(renderCategoryChildren(child.children, `${keyChain}.children`, t, tooltipId, updateParameterFunc, allowUpdateParameter))
            } else {
                //叶节点
                let {label, description, unit, type, default_value, minimum_value, maximum_value, options} = child;
                //TODO
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
                                    disabled={!allowUpdateParameter}
                                    precision={1}
                                    min={minimum_value}
                                    max={maximum_value}
                                    value={default_value}
                                    onAfterChange={(value) => {
                                        updateParameterFunc(keyChain, value)
                                    }}
                                />
                            </Col>
                            }
                            {type === "int" &&
                            <Col span={7}>
                                <NumberInput
                                    disabled={!allowUpdateParameter}
                                    precision={0}
                                    min={minimum_value}
                                    max={maximum_value}
                                    value={default_value}
                                    onAfterChange={(value) => {
                                        updateParameterFunc(keyChain, value)
                                    }}
                                />
                            </Col>
                            }
                            {type === "bool" &&
                            <Col span={7}>
                                <Checkbox
                                    disabled={!allowUpdateParameter}
                                    checked={default_value}
                                    onChange={(e) => {
                                        updateParameterFunc(keyChain, e.target.checked)
                                    }}
                                />
                            </Col>
                            }
                            {type === "enum" &&
                            <Col span={7}>
                                <ConfigSelect
                                    disabled={!allowUpdateParameter}
                                    options={convertOptions(options, t)}
                                    value={default_value}
                                    onChange={(value) => {
                                        updateParameterFunc(keyChain, value)
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

/**
 * 在react elements外包裹Collapse.Panel
 * @param header  string，Collapse.Panel的header文字
 * @param icon    Collapse.Panel的右上角图标，svg文件name
 * @param elements
 * @returns {Array}
 */
const wrapCollapsePanel = (header, icon, elements) => {
    const result = [];
    let extra = null;
    if (icon) {
        extra = <img style={{width: "18px", height: "18px"}} src={require(`./images/${icon}.svg`)}/>
    }
    result.push(
        <Collapse.Panel
            header={header}
            key={header}
            forceRender={true}
            extra={extra}
            style={{
                fontSize: "13px",
            }}
        >
            {elements}
        </Collapse.Panel>
    );
    return result;
};

/**
 * 在Collapse.Panel外包裹Collapse
 * @param panels  Collapse.Panel array
 * @returns {Array}
 */
const wrapCollapse = (panels) => {
    const result = [];
    result.push(
        <Collapse key="1" accordion={true} expandIconPosition="right">
            {panels}
        </Collapse>
    );
    return result;
};

export {renderCategoryChildren, wrapCollapsePanel, wrapCollapse}
