import React from 'react';
import {connect} from 'react-redux';
import Blocks from './Blocks.jsx';
import VariableList from './VariableList.jsx';
import styles from './styles.css';

class Index extends React.Component {
    actions = {
        startVM: () => {
            this.props.vm.greenFlag();
        },
        stopVM: () => {
            this.props.vm.stopAll();
        }
    };

    render() {
        const actions = this.actions;
        const {running} = this.props;
        return (
            <div style={{width: "100%", height: "100%"}}>
                <Blocks/>
                <div className={styles.div_variable_list}>
                    <VariableList/>
                </div>
                <button disabled={!running} onClick={actions.stopVM} className={styles.btn_stop}/>
                <button disabled={running} onClick={actions.startVM} className={styles.btn_green_flag}/>
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

export default connect(mapStateToProps)(Index);

