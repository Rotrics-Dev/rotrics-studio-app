import React, {PureComponent} from 'react';
import {Input} from 'antd';

//props: onPressEnter(value), ...rest(not include: onChange)
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
                        if (this.index > 0) {
                            this.setState({value: this.hisroty[--this.index]});
                        }
                        break;
                    }
                    case 40: {
                        //arrow down
                        e.preventDefault();
                        if (this.index < this.hisroty.length) {
                            this.setState({value: this.hisroty[++this.index]});
                        }
                        break;
                    }
                }
            }
        });
    }

    actions = {
        onChange: (e) => {
            this.setState({value: e.target.value})
        },
        onPressEnter: (e) => {
            const value = e.target.value;
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
