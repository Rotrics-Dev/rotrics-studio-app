import React, {PureComponent} from 'react';
import noop from 'lodash/noop';
import {Space, Popconfirm} from 'antd';
import styles from './styles.css';

const clearConfirmText = 'Are you sure to delete all?';

class Index extends PureComponent {
    render() {
        let {operations = {}, enabledInfo, visibleInfo} = this.props;
        const {undo = noop, redo = noop, layFlat = noop, duplicate = noop, del = noop, clear = noop} = operations;
        if (!enabledInfo) {
            enabledInfo = {undo: true, redo: true, layFlat: true, duplicate: true, del: true, clear: true};
        }
        if (!visibleInfo) {
            visibleInfo = {undo: true, redo: true, layFlat: true, duplicate: true, del: true, clear: true};
        }
        return (
            <div className={styles.div_root}>
                <Space direction={"vertical"} size={0}>
                    {visibleInfo.undo &&
                    <button
                        onClick={undo}
                        className={styles.btn_undo}
                    />
                    }
                    {visibleInfo.redo &&
                    <button
                        onClick={redo}
                        className={styles.btn_redo}
                    />
                    }
                    {visibleInfo.layFlat &&
                    <button
                        disabled={!enabledInfo.layFlat}
                        onClick={layFlat}
                        className={styles.btn_lay_flat}
                    />
                    }
                    {visibleInfo.duplicate &&
                    <button
                        disabled={!enabledInfo.duplicate}
                        onClick={duplicate}
                        className={styles.btn_duplicate}
                    />
                    }
                    {visibleInfo.del &&
                    <button
                        disabled={!enabledInfo.del}
                        onClick={del}
                        className={styles.btn_delete}
                    />
                    }
                    {visibleInfo.clear && !enabledInfo.clear &&
                    <button
                        disabled={true}
                        className={styles.btn_clear}
                    />
                    }
                    {visibleInfo.clear && enabledInfo.clear &&
                    <Popconfirm placement="left" title={clearConfirmText} onConfirm={clear} okText="Yes"
                                cancelText="No">
                        <button
                            className={styles.btn_clear}
                        />
                    </Popconfirm>
                    }
                </Space>
            </div>
        );
    }
}

export default Index;
