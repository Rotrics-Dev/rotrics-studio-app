import React from 'react';
import styles from './styles.css';
import {uploadFile} from "../../../../api";
import {actions as p3dModelActions} from "../../../../reducers/p3dModel";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';

class Index extends React.Component {
    fileInput = React.createRef();

    actions = {
        uploadFile: async (event) => {
            const file = event.target.files[0];
            const filePath =  file.path || 'undefined';
            const response = await uploadFile(file);
            const {url} = response;
            this.props.loadModel(url, filePath)
        },
        onClickUpload: () => {
            this.fileInput.current.value = null;
            this.fileInput.current.click();
        }
    };

    render() {
        const actions = this.actions;
        return (
            <div>
                <input
                    ref={this.fileInput}
                    type="file"
                    accept={'.stl'}
                    style={{display: 'none'}}
                    multiple={false}
                    onChange={actions.uploadFile}
                />
                <button
                    onClick={actions.onClickUpload}
                    className={styles.btn_open}
                />
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        loadModel: (url) => dispatch(p3dModelActions.loadModel(url)),
    };
};

export default connect(null, mapDispatchToProps)(withTranslation()(Index));


