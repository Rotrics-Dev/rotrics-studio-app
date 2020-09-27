import React from 'react';
import {Input, Modal, Row, Col} from 'antd';

export default ({title, onOk, defaultValue}) => {
    const inputRef = React.createRef();
    Modal.confirm({
        title: title,
        width: 500,
        centered: true,
        content: <Row>
            <Col span={8}>
                <span style={{float: "right", margin: "5px 10px 0 0"}}>{`${"Project Name"}:`}</span>
            </Col>
            <Col span={12}>
                <Input
                    ref={inputRef}
                    allowClear={true}
                    placeholder="Input project name"
                    defaultValue={defaultValue}
                />
            </Col>
        </Row>,
        okText: 'OK',
        onOk() {
            return onOk(inputRef.current.input.value)
        },
        cancelText: 'Cancel'
    })
};




