import React from 'react';
import i18next from 'i18next'
import {Input, Modal, Row, Col} from 'antd';

export default ({title, onOk, defaultValue}) => {
    const inputRef = React.createRef();
    Modal.confirm({
        title: i18next.t(title),
        width: 500,
        centered: true,
        content: (
            <Row>
                <Col span={8}>
                    <span style={{float: "right", margin: "5px 10px 0 0"}}>{`${i18next.t("Project Name")}:`}</span>
                </Col>
                <Col span={12}>
                    <Input
                        ref={inputRef}
                        allowClear={true}
                        placeholder={i18next.t("input project name")}
                        defaultValue={defaultValue}
                    />
                </Col>
            </Row>
        ),
        okText: i18next.t('Confirm'),
        cancelText: i18next.t('Cancel'),
        onOk() {
            return onOk(inputRef.current.input.value)
        }
    })
};




