import React from 'react';
import {withTranslation} from 'react-i18next';
import {List, Modal, Checkbox, Select, Row, Col, Radio, Space} from 'antd';
import {actions as fontsActions} from "../../reducers/fonts";
import {connect} from 'react-redux';
import styles from './styles.css'
import {uploadFile} from "../../api";

class Fonts extends React.Component {
    fileInput = React.createRef();

    actions = {
        deleteUserFont: (path) => {
            this.props.deleteUserFont(path);
        },
        onClickUpload: (event) => {
            this.fileInput.current.value = null;
            this.fileInput.current.click();
        },
        uploadUserFont: (event) => {
            const fontFile = event.target.files[0];
            this.props.uploadUserFont(fontFile);
        }
    };

    render() {
        const actions = this.actions;
        const {t} = this.props;
        const {userFonts} = this.props;
        return (
            <div>
                <div style={{width: "300px"}}>
                    <h3>{t("User Fonts")}</h3>
                    <div className={styles.fontContent}>
                        <List
                            split={true}
                            dataSource={userFonts}
                            renderItem={(item, index) => (
                                <List.Item style={{padding: "0px"}}>
                                    <div className={styles.div_item}>
                                        {item.fontName}
                                        <input type="button"
                                               className={styles.btn_delete}
                                               onClick={event => {
                                                   event.stopPropagation();
                                                   actions.deleteUserFont(item.path);
                                               }}/>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </div>
                    <input type="button" onClick={actions.onClickUpload}
                           className={styles.btn_upload}
                           value={t("Add User Fonts")}/>
                    <input
                        ref={this.fileInput}
                        type="file"
                        accept={'.ttf,.svg'}
                        style={{display: 'none'}}
                        multiple={false}
                        onChange={actions.uploadUserFont}
                        className={styles.btn_upload}/>

                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return state.fonts;
};

const mapDispatchToProps = (dispatch) => {
    return {
        deleteUserFont: (fontName) => dispatch(fontsActions.deleteUserFont(fontName)),
        uploadUserFont: (path) => dispatch(fontsActions.uploadUserFont(path))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Fonts));



