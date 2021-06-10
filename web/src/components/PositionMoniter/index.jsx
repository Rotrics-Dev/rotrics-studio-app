import React from 'react';
import socketClientManager from "../../socket/socketClientManager";
import styles from './styles.css'
import {ConfigTitle} from "../Config";
import {withTranslation} from 'react-i18next';
import {Row, Col} from 'antd';

class Index extends React.Component {
    state = {
        x: 0,
        y: 0,
        z: 0,
        e: 0
    };

    componentDidMount() {
        // 监听XYZ
        socketClientManager.addServerListener(
            'FRONT_END_POSITION_MONITOR', (position) => {
                console.log('获取Axes')
                console.log(position)
                this.setState(position);
            }
        );
    }

    render() {
        // 01 增加E轴显示
        const state = this.state;
        const {t} = this.props;

        return (
            <div className={styles.bkg}>
                <ConfigTitle text={t("Axes")} sytle={{margin: "0px", padding: "0px"}}/>
                <div className={styles.axes}>
                    <Row className={styles.border_down}>
                        <Col span={2} push={1} className={styles.border_right}>
                            <span className={styles.text}>X</span>
                        </Col>
                        <Col span={20} push={1} className={styles.value}>
                            <span className={styles.text}>{`${state.x} mm`}</span>
                        </Col>
                    </Row>
                    <Row className={styles.border_down}>
                        <Col span={2} push={1} className={styles.border_right}>
                            <span className={styles.text}>Y</span>
                        </Col>
                        <Col span={20} push={1} className={styles.value}>
                            <span className={styles.text}>{`${state.y} mm`}</span>
                        </Col>
                    </Row>
                    <Row className={styles.border_down}>
                        <Col span={2} push={1} className={styles.border_right}>
                            <span className={styles.text}>Z</span>
                        </Col>
                        <Col span={20} push={1} className={styles.value}>
                            <span className={styles.text}>{`${state.z} mm`}</span>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={2} push={1} className={styles.border_right}>
                            <span className={styles.text}>E</span>
                        </Col>
                        <Col span={20} push={1} className={styles.value}>
                            <span className={styles.text}>{`${state.e} mm`}</span>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}

export default withTranslation()(Index)
