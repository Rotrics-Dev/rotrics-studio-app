import React from 'react';
import Blocks from './Blocks.jsx';
import {connect} from 'react-redux';
import styles from './styles.css';

class Workspace extends React.Component {
    constructor(props) {
        super(props);
    }

    actions = {
        onGreenFlagClick: () => {
            this.props.vm.greenFlag();
        },
        onStopClick: () => {
            this.props.vm.stopAll();
        },
    };

    render() {
        const actions = this.actions;
        const {running} = this.props;
        return (
            <div style={{width: "100%", height: "100%", position: "absolute"}}>
                <Blocks/>
                <button disabled={!running} onClick={actions.onStopClick} className={styles.btn_stop}/>
                <button disabled={running} onClick={actions.onGreenFlagClick} className={styles.btn_green_flag}/>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {vm, running} = state.code;
    return {
        vm,
        running
    };
};

export default connect(mapStateToProps, null)(Workspace);

