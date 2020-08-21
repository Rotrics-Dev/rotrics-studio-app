import React from 'react';
import socketClientManager from "../../socket/socketClientManager";
import styles from './styles.css'
import {ConfigText, ConfigTitle} from "../Config";
import {withTranslation} from 'react-i18next';
import {Row, Col} from 'antd';

class Index extends React.Component {
    state = {
        x: 0,
        y: 0,
        z: 0
    };

    componentDidMount() {
        socketClientManager.addServerListener(
            'FRONT_END_POSITION_MONITOR', (position) => {
                this.setState(position);
            }
        );
    }

    render() {
        const {t} = this.props;
        return (
            <div className={styles.bkg}>
                <ConfigTitle text={t("Axes")} sytle={{marginBottom: "0px", paddingBottom: "0px"}}/>

                <div className={styles.axes}>
                    <Row>
                        <Col span={2} push={1} className={styles.border_right}>
                            <span className={styles.text}>X</span>
                        </Col>
                        <Col span={20} push={1} className={styles.value}>
                            <span className={styles.text}>{`${this.state.x} mm`}</span>
                        </Col>
                    </Row>
                    <Row className={styles.border_up_down}>
                        <Col span={2} push={1} className={styles.border_right}>
                            <span className={styles.text}>Y</span>
                        </Col>
                        <Col span={20} push={1} className={styles.value}>
                            <span className={styles.text}>{`${this.state.y} mm`}</span>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={2} push={1} className={styles.border_right}>
                            <span className={styles.text}>Z</span>
                        </Col>
                        <Col span={20} push={1} className={styles.value}>
                            <span className={styles.text}>{`${this.state.z} mm`}</span>
                        </Col>
                    </Row>
                </div>
            </div>

        )
    }
}

export default withTranslation()(Index)
