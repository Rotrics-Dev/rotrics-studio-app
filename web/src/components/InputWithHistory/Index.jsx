import React, {PureComponent} from 'react';
import {Input} from 'antd';

// props: onPressEnter(value), isUppercase
// ...rest(not include: onChange)
class Index extends PureComponent {
    constructor(props) {
        super(props);
        this.refInput = React.createRef();
        this.hisroty = [];
        this.index = 0;
    }

    state = {
        value: undefined
    };

    componentDidMount() {
        document.addEventListener('keydown', (e) => {
            if (e.target === this.refInput.current.input) {
                switch (e.keyCode) {
                    case 38: {
                        //arrow up
                        e.preventDefault();
                        this.index > 0 && this.setState({value: this.hisroty[--this.index]});
                        break;
                    }
                    case 40: {
                        //arrow down
                        e.preventDefault();
                        this.index < this.hisroty.length && this.setState({value: this.hisroty[++this.index]});
                        break;
                    }
                }
            }
        });
    }

    actions = {
        onChange: (e) => {
            let value = e.target.value;
            if (this.props.isUppercase) {
                value = value.toUpperCase();
            }
            this.setState({value})
        },
        onPressEnter: (e) => {
            let value = e.target.value;
            if (this.props.isUppercase) {
                value = value.toUpperCase();
            }
            this.setState({value: undefined});
            this.hisroty.push(value);
            this.index = this.hisroty.length;
            this.props.onPressEnter(value);
        }
    };

    render() {
        const state = this.state;
        const actions = this.actions;
        const {...rest} = this.props;
        return (
            <Input
                {...rest}
                ref={this.refInput}
                value={state.value}
                onChange={actions.onChange}
                onPressEnter={actions.onPressEnter}
            />
        );
    }
}

export default Index;
