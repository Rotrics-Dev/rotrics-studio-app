import React, {PureComponent} from 'react';
import ReactTooltip from "react-tooltip";
import noop from 'lodash/noop';
import {Space, Popconfirm} from 'antd';
import styles from './styles.css';
import {getUuid} from "../../utils";

const clearConfirmText = 'Are you sure to delete all?';

const tooltipId = getUuid();

class Index extends PureComponent {
    render() {
        let {operations = {}, enabledInfo, visibleInfo} = this.props;
        const {exportModels = noop, undo = noop, redo = noop, layFlat = noop, duplicate = noop, del = noop, clear = noop} = operations;
        if (!enabledInfo) {
            enabledInfo = {
                exportModels: true,
                undo: true,
                redo: true,
                layFlat: true,
                duplicate: true,
                del: true,
                clear: true
            };
        }
        if (!visibleInfo) {
            visibleInfo = {
                exportModels: true,
                undo: true,
                redo: true,
                layFlat: true,
                duplicate: true,
                del: true,
                clear: true
            };
        }
        return (
            <div className={styles.div_root}>
                <ReactTooltip
                    id={tooltipId}
                    place="left"
                    type="info"
                    effect="solid"
                    backgroundColor="#c0c0c0"
                    textColor="#292421"
                    delayShow={500}/>
                <Space direction={"vertical"} size={0}>

                    {visibleInfo.undo &&
                    <button
                        data-for={tooltipId}
                        data-tip="undo"
                        onClick={undo}
                        className={styles.btn_undo}
                    />
                    }
                    {visibleInfo.redo &&
                    <button
                        data-for={tooltipId}
                        data-tip="redo"
                        onClick={redo}
                        className={styles.btn_redo}
                    />
                    }
                    {visibleInfo.layFlat &&
                    <button
                        data-for={tooltipId}
                        data-tip="lay flat"
                        disabled={!enabledInfo.layFlat}
                        onClick={layFlat}
                        className={styles.btn_lay_flat}
                    />
                    }
                    {visibleInfo.duplicate &&
                    <button
                        data-for={tooltipId}
                        data-tip="duplicate"
                        disabled={!enabledInfo.duplicate}
                        onClick={duplicate}
                        className={styles.btn_duplicate}
                    />
                    }
                    {visibleInfo.del &&
                    <button
                        data-for={tooltipId}
                        data-tip="delete"
                        disabled={!enabledInfo.del}
                        onClick={del}
                        className={styles.btn_delete}
                    />
                    }
                    {visibleInfo.clear && !enabledInfo.clear &&
                    <button
                        data-for={tooltipId}
                        data-tip="clear"
                        disabled={true}
                        className={styles.btn_clear}
                    />
                    }
                    {visibleInfo.clear && enabledInfo.clear &&
                    <Popconfirm
                        placement="left"
                        title={clearConfirmText}
                        onConfirm={clear}
                        okText="Yes"
                        cancelText="No"
                    >
                        <button
                            data-for={tooltipId}
                            data-tip="clear"
                            className={styles.btn_clear}
                        />
                    </Popconfirm>
                    }
                    {visibleInfo.exportModels &&
                    <button
                        data-for={tooltipId}
                        data-tip="export models"
                        disabled={!enabledInfo.exportModels}
                        onClick={exportModels}
                        className={styles.btn_export}
                    />
                    }
                </Space>
            </div>
        );
    }
}

export default Index;
