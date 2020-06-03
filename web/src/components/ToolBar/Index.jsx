import React, {PureComponent} from 'react';
import noop from 'lodash/noop';
import {Space} from 'antd';
import styles from './styles.css';

class Index extends PureComponent {
    render() {
        const {operations = {}} = this.props;
        const {undo = noop, redo = noop, duplicate = noop, del = noop, clear = noop} = operations;

        return (
            <div className={styles.div_root}>
                <Space direction={"vertical"} size={0}>
                    <button
                        onClick={undo}
                        className={styles.btn_undo}
                    />
                    <button
                        onClick={redo}
                        className={styles.btn_redo}
                    />
                    <button
                        onClick={duplicate}
                        className={styles.btn_duplicate}
                    />
                    <button
                        onClick={del}
                        className={styles.btn_delete}
                    />
                    <button
                        onClick={clear}
                        className={styles.btn_clear}
                    />
                </Space>

            </div>
        );
    }
}

export default Index;
