import React, {PureComponent} from 'react';
import {Checkbox, Select, Input} from 'antd';
import laserManager from "../../manager/laserManager.js";
import {toFixed} from '../../../shared/lib/numeric-utils.js';
import styles from './styles.css';
import NumberInput from '../../components/NumberInput/Index.jsx';

class ConfigText extends PureComponent {
    state = {
        model2d: null,
        config: null
    };

    componentDidMount() {
        laserManager.on("onChange", (model2d) => {
            let config = model2d ? _.cloneDeep(model2d.settings.config) : null;
            // console.log("change: " + JSON.stringify(config, null, 2))
            this.setState({
                model2d,
                config
            })
        });
    }

    actions = {
        //config text
        setText: (value) => {
            laserManager.updateConfigText("text", value)
        },
        setFont: (value) => {
            laserManager.updateConfigText("font", value)
        },
        setFontSize: (value) => {
            laserManager.updateConfigText("font_size",value)
        },
        setLineHeight: (value) => {
            laserManager.updateConfigText("line_height", value)
        },
        setAlignment: (value) => {
            laserManager.updateConfigText("alignment", value)
        },
        //config
        setOptimizePath: (e) => {
            laserManager.updateConfig("optimize_path", e.target.checked)
        },
        setFill: (e) => {
            laserManager.updateConfig("fill", e.target.checked)
        },
        setFillDensity: (value) => {
            laserManager.updateConfig("fill_density", value)
        },
    };

    render() {
        if (!this.state.model2d || this.state.model2d.fileType !== "text") {
            return null;
        }
        const actions = this.actions;
        const {config_text, config} = this.state;

        const {text, font, font_size, line_height, alignment} = config_text.children;

        const fontOptions = [];
        Object.keys(font.options).forEach((key) => {
            const option = font.options[key];
            fontOptions.push(<Select.Option key={key} value={option}>{key}</Select.Option>)
        });

        const alignmentOptions = [];
        Object.keys(alignment.options).forEach((key) => {
            const option = alignment.options[key];
            alignmentOptions.push(<Select.Option key={key} value={option}>{key}</Select.Option>)
        });

        const {optimize_path, fill} = config.children;
        const {fill_density} = fill.children;

        return (
            <React.Fragment>
                <h2>{config.label}</h2>
                <div>
                    <span>{text.label}</span>
                    <Input.TextArea rows={4} defaultValue={"Hex Bot"} autoSize={false} onPressEnter={(e) => console.log(e.target.value)}/>
                </div>
                <div>
                    <span>{font.label}</span>
                    <Select value={font.default_value} style={{width: 110}}
                            onChange={actions.setFont}>
                        {fontOptions}
                    </Select>
                </div>

                <div>
                    <span>{font_size.label}</span>
                    <NumberInput min={font_size.minimum_value} max={font_size.maximum_value}
                                 value={toFixed(font_size.default_value, 0)}
                                 onChange={actions.setFontSize}/>
                </div>

                <div>
                    <span>{line_height.label}</span>
                    <NumberInput min={line_height.minimum_value} max={line_height.maximum_value}
                                 value={toFixed(line_height.default_value, 0)}
                                 onChange={actions.setLineHeight}/>
                </div>


                <div>
                    <span>{alignment.label}</span>
                    <Select value={alignment.default_value} style={{width: 110}}
                            onChange={actions.setAlignment}>
                        {alignmentOptions}
                    </Select>
                </div>

                <div>
                    <span>{optimize_path.label}</span>
                    <Checkbox checked={optimize_path.default_value} onChange={actions.setOptimizePath}/>
                </div>
                <div>
                    <Checkbox checked={fill.default_value} onChange={actions.setFill}/>
                    <span>{fill.label}</span>
                </div>
                <div>
                    <span>{fill_density.label}</span>
                    <NumberInput min={fill_density.minimum_value} max={fill_density.maximum_value}
                                 value={toFixed(fill_density.default_value, 0)}
                                 onChange={actions.setFillDensity}/>
                </div>
            </React.Fragment>
        );
    }
}

export default ConfigText;

