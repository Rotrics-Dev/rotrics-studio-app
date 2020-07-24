import React, {PureComponent} from 'react';
import ReactTooltip from "react-tooltip";
import noop from 'lodash/noop';
import {Space, Popconfirm} from 'antd';
import styles from './styles.css';
import {getUuid} from "../../utils";

const tooltipId = getUuid();

class Index extends PureComponent {
    render() {
        let {operations = {}, enabledInfo, visibleInfo, tipInfo, clearPopConfirmInfo} = this.props;
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
        if (!tipInfo) {
            tipInfo = {
                exportModels: "export models",
                undo: "undo",
                redo: "redo",
                layFlat: "lay flat",
                duplicate: "duplicate",
                del: "delete",
                clear: "clear"
            };
        }
        if (!clearPopConfirmInfo) {
            clearPopConfirmInfo = {
                cancelText: "NO",
                okText: "OK",
                title: "Are you sure to delete all?"
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
                        data-tip={tipInfo.undo}
                        onClick={undo}
                        className={styles.btn_undo}
                    />
                    }
                    {visibleInfo.redo &&
                    <button
                        data-for={tooltipId}
                        data-tip={tipInfo.redo}
                        onClick={redo}
                        className={styles.btn_redo}
                    />
                    }
                    {visibleInfo.layFlat &&
                    <button
                        data-for={tooltipId}
                        data-tip={tipInfo.layFlat}
                        disabled={!enabledInfo.layFlat}
                        onClick={layFlat}
                        className={styles.btn_lay_flat}
                    />
                    }
                    {visibleInfo.duplicate &&
                    <button
                        data-for={tooltipId}
                        data-tip={tipInfo.duplicate}
                        disabled={!enabledInfo.duplicate}
                        onClick={duplicate}
                        className={styles.btn_duplicate}
                    />
                    }
                    {visibleInfo.del &&
                    <button
                        data-for={tooltipId}
                        data-tip={tipInfo.del}
                        disabled={!enabledInfo.del}
                        onClick={del}
                        className={styles.btn_delete}
                    />
                    }
                    {visibleInfo.clear && !enabledInfo.clear &&
                    <button
                        data-for={tooltipId}
                        data-tip={tipInfo.clear}
                        disabled={true}
                        className={styles.btn_clear}
                    />
                    }
                    {visibleInfo.clear && enabledInfo.clear &&
                    <Popconfirm
                        placement="left"
                        title={clearPopConfirmInfo.title}
                        onConfirm={clear}
                        okText={clearPopConfirmInfo.okText}
                        cancelText={clearPopConfirmInfo.cancelText}
                    >
                        <button
                            data-for={tooltipId}
                            data-tip={tipInfo.clear}
                            className={styles.btn_clear}
                        />
                    </Popconfirm>
                    }
                    {visibleInfo.exportModels &&
                    <button
                        data-for={tooltipId}
                        data-tip={tipInfo.exportModels}
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
