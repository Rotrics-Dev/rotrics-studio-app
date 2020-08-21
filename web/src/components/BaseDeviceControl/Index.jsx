import React from 'react';
import styles from './styles.css';
import {Radio, Space, Row, Col} from 'antd';
import Level from '../Level/Index.jsx'
import {ConfigTitle} from "../Config";
import {withTranslation} from 'react-i18next';

class Index extends React.Component {
    state = {
        showLevel: false,
        pointIndex: undefined,
        accuracy: 0.1
    };

    render() {
        const {home, leftTop, leftBottom, rightTop, rightBottom} = this.props.actions;
        const {xPlus, xMinus, yPlus, yMinus, zPlus, zMinus, z0} = this.props.actions;
        const {setStep, setWorkOrigin, goToWorkOrigin} = this.props.actions;
        const {step} = this.props;
        const {showLevel} = this.props;
        const {t} = this.props;
        const gutter = 8;
        return (
            <div style={{padding: "8px"}}>
                <Row gutter={[gutter, gutter]}>
                    <Col span={6}>
                        <input type="button" onClick={leftTop} className={styles.btn_left_top}/>
                    </Col>
                    <Col span={6}>
                        <input type="button" onClick={yPlus} className={styles.btn_xyz} value="Y+"/>
                    </Col>
                    <Col span={6}>
                        <input type="button" onClick={rightTop} className={styles.btn_right_top}/>
                    </Col>
                    <Col span={6}>
                        <input type="button" onClick={zPlus} className={styles.btn_xyz} value="Z+"/>
                    </Col>
                </Row>
                <Row gutter={[gutter, gutter]}>
                    <Col span={6}>
                        <input type="button" onClick={xMinus} className={styles.btn_xyz} value="X-"/>
                    </Col>
                    <Col span={6}>
                        <input type="button" onClick={home} className={styles.btn_xyz} value="Home"/>
                    </Col>
                    <Col span={6}>
                        <input type="button" onClick={xPlus} className={styles.btn_xyz} value="X+"/>
                    </Col>
                    <Col span={6}>
                        <input type="button" onClick={z0} className={styles.btn_xyz} value="Z0"/>
                    </Col>
                </Row>
                <Row gutter={[gutter, gutter]}>
                    <Col span={6}>
                        <input type="button" onClick={leftBottom} className={styles.btn_left_bottom}/>
                    </Col>
                    <Col span={6}>
                        <input type="button" onClick={yMinus} className={styles.btn_xyz} value="Y-"/>
                    </Col>
                    <Col span={6}>
                        <input type="button" onClick={rightBottom} className={styles.btn_right_bottom}/>
                    </Col>
                    <Col span={6}>
                        <input type="button" onClick={zMinus} className={styles.btn_xyz} value="Z-"/>
                    </Col>
                </Row>
                <Row gutter={[gutter, gutter]}>
                    <Col span={12}>
                        <input type="button" onClick={goToWorkOrigin} className={styles.btn_action_work}
                               value={t("Go To Work Origin")}/>
                    </Col>
                    <Col span={12}>
                        <input type="button" onClick={setWorkOrigin} className={styles.btn_action_work}
                               value={t("Set Work Origin")}/>
                    </Col>
                </Row>
                <Row gutter={[gutter, gutter]}>
                    <Col span={12}>
                        <Level showLevel={showLevel}/>
                    </Col>
                </Row>
                <div>
                    <ConfigTitle text={`${t("Step length")}(mm)`}/>
                    <Radio.Group value={step} buttonStyle="solid" onChange={setStep}>
                        <Radio.Button value={20} className={styles.btn_step}>20</Radio.Button>
                        <Radio.Button value={10} className={styles.btn_step}>10</Radio.Button>
                        <Radio.Button value={5} className={styles.btn_step}>5</Radio.Button>
                        <Radio.Button value={1} className={styles.btn_step}>1</Radio.Button>
                        <Radio.Button value={0.2} className={styles.btn_step}>0.2</Radio.Button>
                        <Radio.Button value={0.1} className={styles.btn_step}>0.1</Radio.Button>
                    </Radio.Group>
                </div>
            </div>
        )
    }
}

export default withTranslation()(Index);

