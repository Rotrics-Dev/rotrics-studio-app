import React from 'react';
import {Input, Modal, Row, Col} from 'antd';

const index = (title, onOk) => {
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
                />
            </Col>
        </Row>,
        okText: 'OK',
        onOk: () => {
            // return new Promise((resolve, reject) => {
            //     setTimeout(() => {
            //         resolve('foo');
            //     }, 3000);
            // });
            onOk(inputRef.current.input.value);
        },
        cancelText: 'Cancel'
    })
};

export default index;



