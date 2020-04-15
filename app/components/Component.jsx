import React from 'react';

let index = 0;

class Component extends React.Component {
    state = {
        msg: ""
    };

    componentDidMount() {
        setInterval(() => {
            this.setState({msg: ++index})
        }, 1000)
    }

    render() {
        return (
            <div>Hello World! {this.state.msg}</div>
        )
    }
}

export default Component;
