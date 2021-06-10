import React from 'react';
import {connect} from 'react-redux';
import {Space} from 'antd';
import styles from './styles.css';

class Index extends React.Component {
    render() {
        // console.log(this.props)
        const {variables} = this.props;
        return (
            <Space direction={"vertical"} size={2} >
                {variables.map(variable => {
                    const {visible, id, value, name} = variable;
                    if (visible) {
                        return (
                            <div key={id} className={styles.div_variable_item}>
                                <span className={styles.div_variable_item_name}>{name}</span>
                                <span className={styles.div_variable_item_value}>{value}</span>
                            </div>
                        );
                    } else {
                        return null;
                    }
                })}
            </Space>
        )
    }
}

const mapStateToProps = (state) => {
    const {variables} = state.code;
    return {
        variables
    };
};

export default connect(mapStateToProps)(Index);

