import React from 'react';
import {Row, Col, Button, Steps, message, Modal, Result} from 'antd';
import {LoadingOutlined, SmileOutlined} from '@ant-design/icons';
import {connect} from 'react-redux';
import styles from './styles.css';
import packageJson from "../../../../electron/package.json";
import {actions as firmwareUpgradeActions} from '../../reducers/firmwareUpgrade.js';

const stepTitles = [
    "Check", //0
    "Collect DexArm info", //1
    "Check need upgrade", //2
    "Download firmware", //3
    "Enter boot loader", //4
    "Connect DexArm", //5
    "Load firmware", //6
    "Execute firmware", //7
    "Done" //8
];

class General extends React.Component {
    state = {
        firmwareUpgradeModalVisible: false,
    };

    actions = {
        closeFirmwareUpgradeModal: () => {
            this.setState({
                firmwareUpgradeModalVisible: false,
            });
        },
        startFirmwareUpgrade: () => {
            this.props.resetFirmwareUpgrade();
            this.props.startFirmwareUpgrade();
            this.setState({
                firmwareUpgradeModalVisible: true,
            });
        },
    };

    render() {
        const state = this.state;
        const actions = this.actions;
        const {firmwareVersion, hardwareVersion, current, status, description, isFirmwareUpToDate, isFirmwareUpgradeSuccess, bootLoaderModalVisible, closeBootLoaderModal} = this.props;
        const verticalSpace = 15;
        const spanCol1 = 8;

        const stepEles = [];
        for (let i = 0; i < stepTitles.length; i++) {
            const title = stepTitles[i];
            stepEles.push(
                <Steps.Step
                    title={title}
                    description={current === i ? description : undefined}
                    icon={(current === i && status === "process") ? <LoadingOutlined/> : undefined}
                />
            )
        }
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
                            <Col span={spanCol1}>
                                Firmware Version
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={actions.startFirmwareUpgrade}
                                >
                                    {"check update"}
                                </Button></Col>
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
                <Modal
                    title="Firmware Upgrade"
                    visible={state.firmwareUpgradeModalVisible}
                    onCancel={actions.closeFirmwareUpgradeModal}
                    footer={null}
                >
                    {!isFirmwareUpToDate && !isFirmwareUpgradeSuccess &&
                    <Steps current={current} direction="vertical" size="small" status={status}>
                        {stepEles}
                    </Steps>
                    }
                    {isFirmwareUpToDate &&
                    <Result
                        icon={<SmileOutlined/>}
                        title="Firmware is up to date, no need to upgrade."
                        extra={<Button type="primary" ghost onClick={actions.closeFirmwareUpgradeModal}>OK</Button>}
                    />
                    }
                    {isFirmwareUpgradeSuccess &&
                    <Result
                        status="success"
                        title="Successfully Upgrade!"
                        extra={<Button type="primary" ghost onClick={actions.closeFirmwareUpgradeModal}>OK</Button>}
                    />
                    }
                </Modal>
                <Modal
                    title="Boot Loader Alert"
                    visible={bootLoaderModalVisible}
                    footer={null}
                    centered={true}
                    closable={false}
                >
                    <p>{"You must upgrade firmware"}</p>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            closeBootLoaderModal();
                            actions.startFirmwareUpgrade();
                        }}
                    >
                        {"start upgrade"}
                    </Button>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {current, status, description, firmwareVersion, hardwareVersion, bootLoaderModalVisible} = state.firmwareUpgrade;
    const isFirmwareUpToDate = (current === 2 && status === "finish");
    const isFirmwareUpgradeSuccess = (current === 8 && status === "finish");
    return {
        firmwareVersion,
        hardwareVersion,
        bootLoaderModalVisible,
        current,
        status,
        description,
        isFirmwareUpToDate,
        isFirmwareUpgradeSuccess
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        closeBootLoaderModal: () => dispatch(firmwareUpgradeActions.closeBootLoaderModal()),
        startFirmwareUpgrade: () => dispatch(firmwareUpgradeActions.start()),
        resetFirmwareUpgrade: () => dispatch(firmwareUpgradeActions.reset()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(General);

