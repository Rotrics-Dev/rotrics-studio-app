import React, {PureComponent} from 'react';
import styles from './styles.css';

//封装，将antd的number input封装进来，和整体ui保持一致
class Index extends PureComponent {
    onChange = (event) => {
        this.setState({
            displayValue: event.target.value
        });
    };

    onBlur = (event) => {
        this.onAfterChangeWrapper(event.target.value);
    };

    onKeyUp = (event) => {
        // 按下[回车]
        if (event.keyCode === 13) {
            this.onAfterChangeWrapper(event.target.value);
        }
    };

    constructor(props) {
        super(props);
        if (props.defaultValue !== undefined) {
            if (props.min !== undefined && props.defaultValue < props.min) {
                console.warn('.defaultValue should greater than or equal to .min')
            }
            if (props.max !== undefined && props.defaultValue > props.max) {
                console.warn('.defaultValue should less than or equal to .max')
            }
        }
        this.state = {
            displayValue: props.value
        };
    }

    getAbsentValue() {
        if (this.props.defaultValue !== undefined) {
            return this.props.defaultValue;
        } else if (this.props.min !== undefined) {
            return this.props.min;
        } else {
            return 0;
        }
    }

    onAfterChangeWrapper(value) {
        const {min, max, onChange} = this.props;

        let numericValue = parseFloat(value);
        let useEdgeValue = false;

        // If value is invalid, use defaultValue
        if (Number.isNaN(numericValue)) {
            const absentValue = this.getAbsentValue();

            onChange(absentValue);
            this.setState({
                displayValue: absentValue
            });
            return;
        }

        // range check
        if (min !== undefined && numericValue < min) {
            numericValue = min;
            useEdgeValue = true;
        }
        if (max !== undefined && numericValue > max) {
            numericValue = max;
            useEdgeValue = true;
        }

        // multiple .setState on edge values won't change props from outside, we
        // need to change display manually
        useEdgeValue && this.setState({displayValue: numericValue});

        // call onAfterChange to change value
        onChange && onChange(numericValue);
    }

    componentWillReceiveProps(nextProps) {
        // If any of .min, .max changed, call .onAfterChangeWrapper once again
        // to check if value is valid.
        const checkKeys = ['min', 'max'];
        const changesMade = checkKeys.some(key => this.props[key] !== nextProps[key]);
        if (changesMade) {
            this.onAfterChangeWrapper(nextProps.value);
        }

        // Changes from outside also reflects on display
        if (nextProps.value !== this.props.value) {
            this.setState({
                displayValue: nextProps.value
            });
        }
    }

    render() {
        const {...rest} = this.props;

        return (
            <input
                {...rest}
                className={styles.number_input}
                style={{width: "100%", borderWidth: "0.5px"}}
                type="number"
                value={this.state.displayValue}
                onChange={this.onChange}
                onBlur={this.onBlur}
                onKeyUp={this.onKeyUp}
            />
        );
    }
}

export default Index;
