import React from 'react';
import {Switch} from 'antd';
import {actions as p3dSettingVisibilityActions} from "../../../../reducers/p3dSettingVisibility";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';

class SettingVisibility extends React.Component {
    actions = {
        changeVisibility: (value) => {
            if (value) {
                this.props.changeVisibility("All")
            } else {
                this.props.changeVisibility("Basic")
            }
        }
    };

    render() {
        const {t} = this.props;
        const {visibility} = this.props;
        const actions = this.actions;
        return (
            <div>
                <span style={{fontSize: "14px", marginLeft: "5px", marginRight: "5px"}}>{t("Show All Settings")}</span>
                <Switch
                    size="small"
                    checked={visibility === "All"}
                    onChange={actions.changeVisibility}/>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {visibility} = state.p3dSettingVisibility;
    return {
        visibility
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        changeVisibility: (visibility) => dispatch(p3dSettingVisibilityActions.changeVisibility(visibility))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SettingVisibility));

