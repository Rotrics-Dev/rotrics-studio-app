import React from 'react';
import {Row, Col} from 'antd';
import {connect} from 'react-redux';
import styles from './styles.css';
import packageJson from "../../../../electron/package.json";

class General extends React.Component {
    state = {};

    actions = {
        changeKey: (e) => {
        },
    };

    render() {
        const state = this.state;
        const actions = this.actions;
        const {firmwareVersion, hardwareVersion} = this.props;
        const verticalSpace = 15;
        const spanCol1 = 8;
        return (
            <div className={styles.div_content}>
                <div style={{width: "100%", height: "190px"}}>
                    <div className={styles.div_product_left}>
                        <button className={styles.btn_right_top}/>
                    </div>
                    <div className={styles.div_product_right}>
                        <h2>The Modular All-in-1 Desktop Robot Arm For Everyone</h2>
                        <h5>The most versatile robot arm with interchangeable modules, easily do laser cutting and 3D
                            printing.</h5>
                    </div>
                </div>
                <div style={{width: "100%", paddingTop: "20px"}}>
                    <h2>Device Info</h2>
                    <div className={styles.div_info}>
                        <Row gutter={[0, verticalSpace]}>
                            <Col span={spanCol1}>Product Name</Col>
                            <Col span={12}>Rotrics DexArm</Col>
                        </Row>
                        <Row gutter={[0, verticalSpace]}>
                            <Col span={spanCol1}>Firmware Version</Col>
                            <Col span={12}>{firmwareVersion}</Col>
                        </Row>
                        <Row gutter={[0, verticalSpace]}>
                            <Col span={spanCol1}>Hardware Version</Col>
                            <Col span={12}>{hardwareVersion}</Col>
                        </Row>
                    </div>
                </div>
                <div style={{width: "100%", paddingTop: "30px", marginBottom: "30px"}}>
                    <h2>Rotrics Studio Info</h2>
                    <div className={styles.div_info}>
                        <Row gutter={[0, verticalSpace]}>
                            <Col span={spanCol1}>Version</Col>
                            <Col span={12}>{`V${packageJson.version}`}</Col>
                        </Row>
                        <Row>
                            <Col span={spanCol1}>Language</Col>
                            <Col span={12}>English</Col>
                        </Row>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {firmwareVersion, hardwareVersion} = state.settings;
    return {
        firmwareVersion,
        hardwareVersion
    };
};

export default connect(mapStateToProps)(General);

