import React from 'react';
import styles from './styles.css';
import {uploadFile, uploadImage} from '../../api/index.js';
import socketManager from "../../socket/socketManager"
class Index extends React.Component {
    fileInput = React.createRef();
    state = {};

    actions = {
        onClickToUpload: () => {
            this.fileInput.current.value = null;
            this.fileInput.current.click();
        },
        onChangeFile: (event) => {
            const file = event.target.files[0];
            uploadImage(
                file,
                (json) => {
                    console.log(json)
                },
                (err) => {
                    console.log(err)
                }
            );
        },
        initSocket: () => {
            socketManager.setup();
        },
    };

    render() {
        const actions = this.actions;
        return (
            <div>
                <h2>{"welcome"}</h2>

                <input
                    ref={this.fileInput}
                    type="file"
                    accept=".stl, .obj, .png, .jpg"
                    style={{display: 'none'}}
                    multiple={false}
                    onChange={actions.onChangeFile}
                />
                <button
                    type="button"
                    style={{float: 'left'}}
                    title={'Upload File'}
                    onClick={actions.onClickToUpload}
                >
                    {'Upload File'}
                </button>

                <button
                    type="button"
                    style={{float: 'right'}}
                    onClick={actions.initSocket}
                >
                    {'init socket'}
                </button>

                <button
                    type="button"
                    onClick={()=>{
                        socketManager.emit("query-serialPort")
                    }}
                >
                    {'init socket'}
                </button>
            </div>
        )
    }
}

export default Index;
