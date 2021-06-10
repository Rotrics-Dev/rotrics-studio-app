import React from 'react';
import styles from './styles.css';
import {Radio, Space, Row, Col, Modal, Form, Input, message, Menu, Dropdown, Tooltip} from 'antd';
import PositionMonitor from '../PositionMoniter/index.jsx'
import Level from '../Level/Index.jsx'
import {ConfigTitle} from "../Config";
import {withTranslation} from 'react-i18next';

// 本地存储键
const CUSTOM_BUTTON_KEY = 'CUSTOM_BUTTON'
class Index extends React.Component {
    state = {
        showLevel: false,
        pointIndex: undefined,
        accuracy: 0.1,

        // 自定义弹窗相关

        // 表单控件
        formRef: React.createRef(),
        
        // 是否显示自定义弹窗
        modalVisible: false,

        // 自定义按钮名
        customButtonName: '',

        // 自定义按钮命令
        customButtonCommand: '',

        // 已加入的自定义按钮
        customButtons: [],

        // 正在编辑的自定义按钮索引
        currentCustomButtonIndex: -1
    };

    actions = {
        // 打开自定义按钮弹窗
        openCustomButtonModal: () => {
            const { currentCustomButtonIndex } = this.state
            const existButton = currentCustomButtonIndex === -1 
                ? null 
                : this.state.customButtons[currentCustomButtonIndex]
            
            console.log(existButton)
            
            this.setState({
                customButtonName: existButton ? existButton.name : '',
                customButtonCommand: existButton ? existButton.command : ''
            }, () => {
                this.setState({
                    modalVisible: true 
                })
            })
        },

        // 关闭自定义按钮弹窗
        closeCustomButtonModal: () => {
            this.setState({
                modalVisible: false,
                customButtonName: '',
                customButtonCommand: ''
            })

            // 清除表单
            this.state.formRef.current.resetFields()
        },

        // 创建自定义按钮
        saveCustomButton: () => {
            // 判断名称
            if (!this.state.customButtonName) {
                message.warn(this.props.t("Input custom button name"))
                return
            }

            // 判断命令
            if (!this.state.customButtonCommand) {
                message.warn(this.props.t("Input command"))
                return
            }

            // 获取行数并判断是否多于100行
            const rowCount = this.state.customButtonCommand.split('\n').length
            if (rowCount > 100) {
                message.warn('Please enter commands less than 100 lines')
                return
            }

            if (this.state.currentCustomButtonIndex === -1) {
                // 创建按钮
                // 判断是否存在
                const isExist = this.state.customButtons
                    .some((item) => item.name === this.state.customButtonName)
                
                if (isExist) {
                    // 存在
                    message.warning(`${this.state.customButtonName} 已被使用`)
                } else {
                    // 不存在
                    this.setState({
                        currentCustomButtonIndex: -1,
                        modalVisible: false,
                        customButtons: [
                            ...this.state.customButtons,
                            {
                                name: this.state.customButtonName,
                                command: this.state.customButtonCommand
                            }
                        ]
                    }, () => {
                        // 保存自定义按钮
                        message.success(this.props.t("Create success"))
                        localStorage.setItem(CUSTOM_BUTTON_KEY, JSON.stringify(this.state.customButtons))
                    })
                }
                
            } else {
                // 修改按钮
                const newCustomButtons = _.cloneDeep(this.state.customButtons)
                newCustomButtons[this.state.currentCustomButtonIndex].name = this.state.customButtonName
                newCustomButtons[this.state.currentCustomButtonIndex].command = this.state.customButtonCommand
                this.setState({
                    currentCustomButtonIndex: -1,
                    modalVisible: false,
                    customButtons: newCustomButtons
                }, () => {
                    // 保存自定义按钮
                    // message.success("编辑成功")
                    localStorage.setItem(CUSTOM_BUTTON_KEY, JSON.stringify(this.state.customButtons))
                })
            }
        },

        // 输入按钮名
        onCustomButtonNameChange: (e) => {
            this.setState({
                customButtonName: e.target.value
            })
        },

        // 输入按钮命令
        onCustomButtonCommandChange: (e) => {
            this.setState({
                customButtonCommand: e.target.value
            })
        },

        // 点击按钮名
        onCustomButtonClick: (command) => {
            this.props.startTask(command, false)
        },

        // 删除自定义按钮
        deleteCustomButton: async (index) => {
            const confirm = () => new Promise((resolve) => {
                Modal.confirm({
                    title: this.props.t("Are you sure to delete?"),
                    onOk () {
                      resolve(true)  
                    },
                    onCancel () {
                        resolve(false)
                    }
                })
            })

            const confirmRes = await confirm()
            if (!confirmRes) return

            const newCustomButtons = _.cloneDeep(this.state.customButtons)
            if (index >= 0) {
                newCustomButtons.splice(index, 1)
            }
            this.setState({
                customButtons: newCustomButtons
            })

            localStorage.setItem(CUSTOM_BUTTON_KEY, JSON.stringify(newCustomButtons))
        }
    };

    componentDidMount () {
        // 读取自定义按钮
        let result = null
        const customCommandStr = localStorage.getItem(CUSTOM_BUTTON_KEY)
        try {
            result = JSON.parse(customCommandStr)
        } catch (error) {
            console.log(error)
        }

        this.setState({
            customButtons: result || []
        })
    }

    render() {
        // console.log(this)
        const {home, leftTop, leftBottom, rightTop, rightBottom, onCustomButtonRightClick} = this.props.actions;
        const {xPlus, xMinus, yPlus, yMinus, zPlus, zMinus, z0} = this.props.actions;
        const {setStep, setWorkOrigin, goToWorkOrigin} = this.props.actions;
        const {frontEnd} = this.props;
        const {step} = this.props;
        const {showLevel} = this.props;
        const {t} = this.props;
        const gutter = 8;

        // 自定义按钮相关
        const {
            formRef,
            modalVisible, 
            customButtonCommand, 
            customButtonName,
            customButtons
        } = this.state

        const getMenus = (index) => {
            return <Menu>
                <Menu.Item onClick={() => {
                    this.setState({
                        currentCustomButtonIndex: index
                    }, () => {
                        this.actions.openCustomButtonModal()
                    })
                }}>{t('Edit')}</Menu.Item>
                <Menu.Item onClick={() => {
                    this.actions.deleteCustomButton(index)
                }}>{t('Delete')}</Menu.Item>
            </Menu>
        }

        // 渲染自定义按钮
        const customButtonDoms = customButtons.map((item, index) => {
            return <Dropdown key={item.name} overlay={getMenus(index)} trigger={['contextMenu']}>
                <Col span={6}>
                <input 
                    type="button" 
                    onClick={() => this.actions.onCustomButtonClick(item.command)} 
                    className={styles.btn_xyz} 
                    value={item.name}
                    alt={['custom', index]}
                />
                </Col>
            </Dropdown>
        })

        const {
            openCustomButtonModal, 
            closeCustomButtonModal,
            saveCustomButton,
            onCustomButtonNameChange,
            onCustomButtonCommandChange,
            onCustomButtonClick
        } = this.actions

        return (
            <div style={{padding: "8px"}}>
                <PositionMonitor/>
                <Row gutter={[gutter, gutter]} style={{ paddingBottom: '10px' }}>
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
                    {/*  */}
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
                    {/*  */}
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
                    {/*  */}
                    <Col span={12}>
                        <Tooltip placement="top" title={t("Go To Work Height")}>
                            <input 
                                type="button" 
                                onClick={goToWorkOrigin} 
                                className={styles.btn_action_work}
                                value={t("Go To Work Height")}
                            />
                        </Tooltip>
                    </Col>
                    <Col span={12}>
                        <Tooltip placement="top" title={t("Go To Work Height")}>
                            <input 
                                type="button" 
                                onClick={setWorkOrigin} 
                                className={styles.btn_action_work}
                                value={t("Set Work Height")}
                            />
                        </Tooltip>
                    </Col>
                    {/*  */}
                    {showLevel && <Col span={12}>
                        <Level showLevel={showLevel}/>
                    </Col> }
                    {/*  */}
                    {customButtonDoms}
                    <Col span={6}>
                        <input 
                            type="button" 
                            onClick={() => {
                                this.setState({ currentCustomButtonIndex: -1 }, () => {
                                    openCustomButtonModal()
                                })
                            }} 
                            className={styles.btn_create} 
                        />
                    </Col>
                </Row>
                <div>
                    <ConfigTitle text={`${t("Step Length")}(mm)`}/>
                    <Radio.Group value={step} buttonStyle="solid" onChange={setStep}>
                        <Radio.Button value={20} className={styles.btn_step}>20</Radio.Button>
                        <Radio.Button value={10} className={styles.btn_step}>10</Radio.Button>
                        <Radio.Button value={5} className={styles.btn_step}>5</Radio.Button>
                        <Radio.Button value={1} className={styles.btn_step}>1</Radio.Button>
                        <Radio.Button value={0.2} className={styles.btn_step}>0.2</Radio.Button>
                        <Radio.Button value={0.1} className={styles.btn_step}>0.1</Radio.Button>
                    </Radio.Group>
                </div>
                {/* 自定义按钮弹窗 */}
                {modalVisible && <Modal 
                    title={t("Custom Button")}
                    cancelText={t("Cancel")}
                    okText={t("Save")}
                    visible={modalVisible}
                    forceRender={true}
                    onOk={saveCustomButton}
                    onCancel={closeCustomButtonModal}>
                        <Form
                            ref={formRef}
                            labelCol={{ span: 6 }}>
                            <Form.Item
                                label={t("Name")}
                                name="name"
                                rules={[{ 
                                    required: true,
                                    message: t("Input custom button name")
                                }]}
                                initialValue={customButtonName}>
                                <Input
                                    placeholder={t("Input custom button name")}
                                    value={customButtonName}
                                    onChange={onCustomButtonNameChange}
                                />
                            </Form.Item>
                            <Form.Item
                                label={t("Command")}
                                name="command"
                                rules={[{ 
                                    required: true,
                                    message: t("Input command")
                                }]}
                                initialValue={customButtonCommand}>
                                <Input.TextArea
                                    placeholder={t("Input command")}
                                    autoSize={{ minRows: 10 }}
                                    value={customButtonCommand}
                                    onChange={onCustomButtonCommandChange}
                                />
                            </Form.Item>
                        </Form>
                </Modal>}
            </div>
        )
    }
}

export default withTranslation()(Index);

