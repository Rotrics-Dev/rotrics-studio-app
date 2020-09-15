import React from 'react';
import {Button, Modal} from 'antd';

const index = ({title, onSave, onDoNotSave, saveText = "Save", doNotSaveText = "Don't save"}) => {
    const modal = Modal.confirm({
        title,
        content: <Button
            style={{position: "absolute", left: "30px", bottom: "25px"}}
            onClick={() => {
                modal.destroy()
            }}>Cancel</Button>,
        okText: saveText,
        onOk: onSave,
        cancelText: doNotSaveText,
        onCancel: onDoNotSave,
    })
};

export default index;



