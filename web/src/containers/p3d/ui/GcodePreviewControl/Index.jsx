import React from 'react';
import {connect} from 'react-redux';
import styles from './styles.css';
import {Slider, Checkbox, Space} from 'antd';
import {actions as p3dModelActions} from "../../../../reducers/p3dModel";

class Index extends React.Component {
    render() {
        if (!this.props.gcodeObj3d || !this.props.lineTypeVisibility) {
            return null;
        }
        const {setLayerCountVisible, updateLineTypeVisibility} = this.props;
        const {lineTypeVisibility, layerCount = 0, layerCountVisible = 0} = this.props;

        const lineTypeEles = [];
        Object.keys(lineTypeVisibility).forEach((key) => {
            const value = lineTypeVisibility[key];
            const {rgb, visible} = value;
            lineTypeEles.push(
                <div key={key} style={{width: "150px"}}>
                    <Checkbox checked={visible} onClick={(e) => {
                        updateLineTypeVisibility(key, e.target.checked)
                    }}/>
                    {key}
                    <span className={styles.span_type_block}
                          style={{backgroundColor: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`}}></span>
                </div>
            );
        });
        return (
            <div style={{height: "100%"}}>
                <Slider vertical max={layerCount} value={layerCountVisible}
                        onChange={setLayerCountVisible}/>
                <div className={styles.div_line_type_container}>
                    <Space direction="vertical">
                        {lineTypeEles}
                    </Space>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {gcodeObj3d, result, lineTypeVisibility, layerCount, layerCountVisible} = state.p3dModel;
    return {
        gcodeObj3d,
        result,
        lineTypeVisibility,
        layerCount,
        layerCountVisible
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setLayerCountVisible: (value) => dispatch(p3dModelActions.setLayerCountVisible(value)),
        updateLineTypeVisibility: (key, value) => dispatch(p3dModelActions.updateLineTypeVisibility(key, value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
