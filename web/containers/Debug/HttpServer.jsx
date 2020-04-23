import React from 'react';
import styles from './styles.css';
import {uploadFile, uploadImage} from '../../api/index.js';

class HttpServer extends React.Component {
    fileInput = React.createRef();
    imageInput = React.createRef();
    state = {};

    actions = {
        onClickToUploadFile: () => {
            this.fileInput.current.value = null;
            this.fileInput.current.click();
        },
        onClickToUploadImage: () => {
            this.imageInput.current.value = null;
            this.imageInput.current.click();
        },
        onChangeFile: async (event) => {
            const file = event.target.files[0];
            const response = await uploadFile(file);
            console.log(response)
        },
        onChangeImage: async (event) => {
            const file = event.target.files[0];
            const response = await uploadImage(file);
            console.log(response)
        }
    };

    render() {
        const actions = this.actions;
        return (
            <div>
                <h2>{"DebugHttpServer"}</h2>
                <input
                    ref={this.fileInput}
                    type="file"
                    accept=".stl, .obj"
                    style={{display: 'none'}}
                    multiple={false}
                    onChange={actions.onChangeFile}
                />
                <input
                    ref={this.imageInput}
                    type="file"
                    accept=".png, .jpg"
                    style={{display: 'none'}}
                    multiple={false}
                    onChange={actions.onChangeImage}
                />
                <button
                    type="button"
                    title={'Upload File'}
                    onClick={actions.onClickToUploadFile}
                >
                    {'Upload File'}
                </button>
                <br/>
                <button
                    type="button"
                    title={'Upload File'}
                    onClick={actions.onClickToUploadImage}
                >
                    {'Upload Image'}
                </button>
            </div>
        )
    }
}

export default HttpServer;
