import React from 'react';
import i18next from 'i18next'
import {Button, Modal} from 'antd';

export default ({title, onOk, onCancel}) => {
    const modal = Modal.confirm({
        title: i18next.t(title),
        centered: true,
        content:
            <Button
                style={{position: "absolute", left: "30px", bottom: "25px"}}
                onClick={() => {
                    modal.destroy()
                }}>
                {i18next.t('Cancel')}
            </Button>,
        okText: i18next.t("Save as"),
        cancelText: i18next.t("Don't save as"),
        onOk,
        onCancel,
    })
};




