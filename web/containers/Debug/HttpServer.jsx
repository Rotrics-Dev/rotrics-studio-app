import React from 'react';
import styles from './styles.css';
import {uploadFile, uploadImage, text2svg} from '../../api/index.js';

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
        },
        text2svg: async () => {
            const text = "hello world";

            const attributes = {fill: 'red', stroke: 'black'};
            const options = {x: 0, y: 0, fontSize: 40, anchor: 'top', attributes: attributes};

            const response = await text2svg(text, options);
            console.log(response)
        },

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

                <button
                    type="button"
                    onClick={actions.text2svg}
                >
                    {'text2svg'}
                </button>
            </div>
        )
    }
}

export default HttpServer;
