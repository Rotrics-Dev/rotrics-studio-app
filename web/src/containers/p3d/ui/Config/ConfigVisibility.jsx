import React from 'react';
import {Radio, Collapse} from 'antd';
import {actions as p3dConfigVisibilityActions} from "../../../../reducers/p3dConfigVisibility";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';

class ConfigVisibility extends React.Component {
    actions = {
        onChange: (e) => {
            this.props.changeVisibility(e.target.value)
        }
    };

    render() {
        const {t} = this.props;
        const {visibility} = this.props;
        const actions = this.actions;
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        };
        return (
            <div>
                <Collapse defaultActiveKey={['1']} expandIconPosition="right">
                    <Collapse.Panel header="Setting Visibility" key="1">
                        <Radio.Group
                            style={{padding: "3px 0 0 8px"}}
                            key="2"
                            size="small"
                            defaultValue={visibility}
                            onChange={actions.onChange}
                        >
                            <Radio style={radioStyle} value={"Basic"} checked={visibility === "Basic"}>
                                {"Basic"}
                            </Radio>
                            <Radio style={radioStyle} value={"All"} checked={visibility === "All"}>
                                {"All"}
                            </Radio>
                        </Radio.Group>
                    </Collapse.Panel>
                </Collapse>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {visibility} = state.p3dConfigVisibility;
    return {
        visibility
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        changeVisibility: (visibility) => dispatch(p3dConfigVisibilityActions.changeVisibility(visibility))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ConfigVisibility));

