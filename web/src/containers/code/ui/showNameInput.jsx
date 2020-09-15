import React from 'react';
import {Input, Modal, Row, Col} from 'antd';

const index = ({title, onOk, defaultValue}) => {
    const inputRef = React.createRef();
    Modal.confirm({
        title: title,
        width: 500,
        content: <Row>
            <Col span={8}>
                <span style={{float: "right", margin: "5px 10px 0 0"}}>{`${"Project Name"}:`}</span>
            </Col>
            <Col span={12}>
                <Input
                    ref={inputRef}
                    allowClear={true}
                    placeholder="input project name"
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

export default index;



