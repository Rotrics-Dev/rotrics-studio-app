import React from 'react';
import {Row, Col} from 'antd';
import {connect} from 'react-redux';
import styles from './styles.css';
import packageJson from "../../../../electron/package.json";
import Console from 'react-console-component';
import 'react-console-component/main.css';

class General extends React.Component {
    state = {};

    constructor(props) {
        super(props);

        this.refConsole = React.createRef();
    }

    actions = {
        //console
        openConsolePortModal: () => {
            this.setState({
                consoleModalVisible: true,
            });
        },
        closeConsolePortModal: () => {
            this.setState({
                consoleModalVisible: false,
            });
        },
        echo: (text) => {
            console.log(text)

            this.refConsole.current.log(text);
            this.refConsole.current.return();
            // this.setState({
            //     count: this.state.count + 1,
            // }, this.child.console.return);
        },
        promptLabel: () => {
            return "# "
            // return this.state.count + "> ";
        }
    };


    render() {
        const state = this.state;
        const actions = this.actions;
        const {firmwareVersion, hardwareVersion} = this.props;
        const verticalSpace = 15;
        const spanCol1 = 8;
        return (
            <div className={styles.div_content}>
                <div style={{width: "100%", height: "190px", backgroundColor: "#e0e0e0"}}>
                    <Console
                        ref={this.refConsole}
                        handler={actions.echo}
                        promptLabel={actions.promptLabel}
                        welcomeMessage={"Welcome to the react-console demo!\nThis is an example of a simple echo console."}
                        autofocus={true}
                    />
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {firmwareVersion, hardwareVersion} = state.settings;
    return {
        firmwareVersion,
        hardwareVersion
    };
};

export default connect(mapStateToProps)(General);

