import React from 'react';
import styles from './styles.css';
import {Radio, Space} from 'antd';
import Level from '../Level/Index.jsx'
import {ConfigTitle} from "../Config";
import Line from '../../components/Line/Index.jsx'
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
        return (
            <div>
                <Space direction={"vertical"} style={{padding: "8px 8px 0px 8px"}}>
                    <Space direction={"horizontal"}>
                        <button
                            onClick={leftTop}
                            className={styles.btn_left_top}
                        />
                        <button
                            onClick={yPlus}
                            className={styles.btn_xyz}
                        >Y+
                        </button>
                        <button
                            onClick={rightTop}
                            className={styles.btn_right_top}
                        />
                        <button
                            onClick={zPlus}
                            className={styles.btn_xyz}
                        >Z+
                        </button>
                    </Space>
                    <Space direction={"horizontal"}>
                        <button
                            onClick={xMinus}
                            className={styles.btn_xyz}
                        >X-
                        </button>
                        <button
                            onClick={home}
                            className={styles.btn_xyz}
                        >Home
                        </button>
                        <button
                            onClick={xPlus}
                            className={styles.btn_xyz}
                        >X+
                        </button>
                        <button
                            onClick={z0}
                            className={styles.btn_xyz}
                        >Z0
                        </button>
                    </Space>
                    <Space direction={"horizontal"}>
                        <button
                            onClick={leftBottom}
                            className={styles.btn_left_bottom}
                        />
                        <button
                            onClick={yMinus}
                            className={styles.btn_xyz}
                        >Y-
                        </button>
                        <button
                            onClick={rightBottom}
                            className={styles.btn_right_bottom}
                        />
                        <button
                            onClick={zMinus}
                            className={styles.btn_xyz}
                        >Z-
                        </button>
                    </Space>

                    <button
                        onClick={goToWorkOrigin}
                        className={styles.btn_action_work}
                    >{t("Go To Work Origin")}
                    </button>
                    <button
                        onClick={setWorkOrigin}
                        className={styles.btn_action_work}
                    >{t("Set Work Origin")}
                    </button>
                    <Level showLevel={showLevel}/>
                </Space>
                <div style={{padding: "0px 8px 8px 8px"}}>

                    <ConfigTitle text={t("Step length")} sytle={{marginBottom: "0px", paddingBottom: "0px"}}/>
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

