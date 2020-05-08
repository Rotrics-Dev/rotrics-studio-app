import React, {PureComponent} from 'react';
import {Checkbox, Select, Input} from 'antd';
import {connect} from 'react-redux';
import laserManager from "../../manager/laserManager.js";
import {toFixed} from '../../../shared/lib/numeric-utils.js';
import styles from './styles.css';
import {actions as laserTextActions} from '../../reducers/laserText';
import NumberInput from '../../components/NumberInput/Index.jsx';
import _ from 'lodash';

class ConfigText extends PureComponent {
    state = {
        model2d: null,
        config: null,
        //config_text
        text: "",
        font: "",
        font_size: 72
    };

    componentDidMount() {
        laserManager.on("onChange", (model2d) => {
            let config = model2d ? _.cloneDeep(model2d.settings.config) : null;
            let config_text = model2d ? _.cloneDeep(model2d.userData.config_text) : null;

            // console.log("change: " + JSON.stringify(config, null, 2))
            this.setState({
                model2d,
                config,
                config_text
            })
        });
    }

    actions = {
        //config text
        setText: (e) => {
            console.log(e.target.value)
            this.props.updateConfigText("text", e.target.value.trim())
        },
        setFont: (value) => {
            this.props.updateConfigText("font", value)
        },
        setFontSize: (value) => {
            this.props.updateConfigText("font_size", value)
        },
        //config
        setOptimizePath: (e) => {
            laserManager.updateConfig("optimize_path", e.target.checked)
        },
        setFill: (e) => {
            laserManager.updateConfig("fill", e.target.checked)
        },
        setFillDensity: (value) => {
            laserManager.updateConfig("fill.fill_density", value)
        },
    };

    render() {
        if (!this.state.model2d || this.state.model2d.fileType !== "text") {
            return null;
        }
        const actions = this.actions;
        const {config_text} = this.props;
        const {config} = this.state;

        const {text, font, font_size} = config_text.children;

        const fontOptions = [];
        Object.keys(font.options).forEach((key) => {
            const option = font.options[key];
            fontOptions.push(<Select.Option key={key} value={option}>{key}</Select.Option>)
        });

        const {optimize_path, fill} = config.children;
        const {fill_density} = fill.children;

        return (
            <React.Fragment>
                <h2>{config.label}</h2>
                <div>
                    <span>{text.label}</span>
                    <Input.TextArea defaultValue={"Hex Bot"} autoSize={{minRows: 1, maxRows: 1}}
                                    onChange={actions.setText}
                    />
                </div>
                <div>
                    <span>{font.label}</span>
                    <Select value={font.default_value} style={{width: 150}}
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

const mapStateToProps = (state) => {
    const {config_text} = state.laserText;
    return {
        config_text
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        updateConfigText: (key, value) => dispatch(laserTextActions.updateConfigText(key, value)),
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(ConfigText);

