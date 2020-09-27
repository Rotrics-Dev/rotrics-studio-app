import React from 'react';
import {Button, Modal} from 'antd';

export default ({title, onSave, onDoNotSave, saveText = "Save", doNotSaveText = "Don't save"}) => {
    const modal = Modal.confirm({
        title,
        centered: true,
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




