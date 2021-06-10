import React from 'react';
import ToolBar from '../ToolBar/Index.jsx';
import {withTranslation} from 'react-i18next';

class Index extends React.Component {
    render() {
        const {t} = this.props;
        const {...rest} = this.props;
        const tipInfo = {
            exportModels: t("export models"),
            undo: t("undo"),
            redo: t("redo"),
            layFlat: t("lay flat"),
            duplicate: t("duplicate"),
            del: t("delete"),
            clear: t("clear"),
        };
        const clearPopConfirmInfo = {
            cancelText: t("NO"),
            okText: t("OK"),
            title: t("Are you sure to delete all?")
        };
        return (
            <ToolBar
                {...rest}
                tipInfo={tipInfo}
                clearPopConfirmInfo={clearPopConfirmInfo}
            />
        )
    }
}

export default withTranslation()(Index);

