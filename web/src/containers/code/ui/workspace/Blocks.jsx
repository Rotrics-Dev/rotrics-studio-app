import React from 'react';
import {connect} from 'react-redux';
import i18next from 'i18next'
import {withTranslation} from 'react-i18next';
import ScratchBlocks from 'rotrics-scratch-blocks';
import makeToolboxXML from '../../lib/make-toolbox-xml';
import {TAP_CODE} from "../../../../constants.js";
import {activateCustomProcedures, deactivateCustomProcedures} from '../../../../reducers/custom-procedures';
import { Modal, Input, Form } from 'antd'
import _ from 'lodash'

const BLOCKS_DEFAULT_OPTIONS = {
    media: './asset/rotrics-scratch-blocks/media/',
    zoom: {
        controls: false,
        wheel: false,
        startScale: 0.675
    },
    grid: {
        spacing: 40,
        length: 2,
        colour: '#ddd'
    },
    colours: {
        workspace: '#F9F9F9',
        flyout: '#F9F9F9',
        toolbox: '#FFFFFF',
        toolboxSelected: '#E9EEF2',
        scrollbar: '#CECDCE',
        scrollbarHover: '#CECDCE',
        insertionMarker: '#000000',
        insertionMarkerOpacity: 0.2,
        fieldShadow: 'rgba(255, 255, 255, 0.3)',
        dragShadowOpacity: 0.6
    },
    comments: true,
    collapse: false,
    sounds: false
};

// map local from "cura" to "scratch"
const getLocale = (language) => {
    switch (language) {
        case "de-DE":
            return "de";
        case "en":
            return "en";
        case "es-ES":
            return "de";
        case "fr-FR":
            return "fr";
        case "it-IT":
            return "it";
        case "ja-JP":
            return "ja";
        case "ko-KR":
            return "ko";
        case "ru-RU":
            return "ru";
        case "zh-CN":
            return "zh-cn";
        case "zh-TW":
            return "zh-tw";
        case "pt-BR":
            return "pt-br";
        default:
            return "en";
    }
};

class Blocks extends React.Component {
    constructor(props) {
        super(props);
        this.blocks = React.createRef();
        this.workspace = null;
        this.flyoutWorkspace = null;
    }

    state = {
        // 是否显示弹窗
        modalVisible: false,

        // 变量名
        variableName: ''
    }

    actions = {
        // 打开关闭变量名弹窗
        toggleModal: (value) => {
            this.setState({
                modalVisible: value,
                variableName: value ? '' : this.state.variableName
            })
        },

        // 输入变量
        onVariableNameChange: (value) => {
            this.setState({
                variableName: value
            })
        },

        // 保存
        saveVariableName: () => {
            console.log(11)
        },

        // 创建新变量
        onCreareVariableName: () => {
            return new Promise((resolve) => {
                const { t } = this.props
                const inputRef = React.createRef();
                Modal.confirm({
                    title: this.props.t("Create new variable"),
                    content: (
                        <Form
                            labelCol={{ span: 6 }}
                            labelAlign={'left'}>
                            <Form.Item
                                label={this.props.t("Name")}
                                name="name">
                                <Input
                                    ref={inputRef}
                                    placeholder={this.props.t("Please input variable name")}
                                    defaultValue={''}
                                />
                            </Form.Item>
                        </Form>
                    ),
                    cancelText: t('Cancel'),
                    okText: t("Save"),
                    onOk () {
                        resolve(inputRef.current.input.value)
                    },
                    onCancel () {
                        resolve('')
                    }
                })
            })
        }
    }
    

    componentDidMount() {
        ScratchBlocks.Procedures.externalProcedureDefCallback = this.props.onActivateCustomProcedures;
        
        // ScratchBlocks.prompt
        console.log(Modal.info)
        window.test = async () => {
            const res = await this.actions.onCreareVariableName()
            console.log(res)
            return res
        }
        const toolbox = makeToolboxXML();
        const workspaceConfig = Object.assign(
            {},
            BLOCKS_DEFAULT_OPTIONS,
            {toolbox: toolbox}
        );

        this.workspace = ScratchBlocks.inject(this.blocks.current, workspaceConfig);
        this.attachVM();

        this.updateCss();

        //language
        if (getLocale(this.props.i18n.language) !== this.props.vm.getLocale()) {
            this.changeLocale(getLocale(this.props.i18n.language));
        }
        i18next.on('languageChanged', (lng) => {
            const locale = getLocale(lng)
            if (locale !== this.props.vm.getLocale()) {
                this.changeLocale(locale);
            }
        });

        this.props.vm.refreshWorkspace();
    }

    changeLocale = (locale) => {
        ScratchBlocks.ScratchMsgs.setLocale(locale);
        this.props.vm.setLocale(locale)
            .then(() => {
                //必须调用setRecyclingEnabled，否则部分blocks不会正常显示多语言
                ScratchBlocks.getMainWorkspace().getFlyout().setRecyclingEnabled(false);
                this.props.vm.refreshWorkspace();
            });
    };

    updateCss() {
        //参考：rotrics-scratch-blocks/core/css.js
        const injectionDiv = document.getElementsByClassName('injectionDiv')[0];
        injectionDiv.style.borderTopRightRadius = '5px';
        injectionDiv.style.borderBottomRightRadius = '5px';
        injectionDiv.style.borderBottom = 'solid 1px rgba(0,0,0,.15)';

        const blocklyFlyout = document.getElementsByClassName('blocklyFlyout')[0];
        blocklyFlyout.style.borderRight = 'solid 1px rgba(0,0,0,.15)';

        const blocklyToolboxDiv = document.getElementsByClassName('blocklyToolboxDiv')[0];
        blocklyToolboxDiv.style.borderRight = 'solid 1px rgba(0,0,0,.15)';

        //注意顺序，必须先设置css，后resize
        ScratchBlocks.svgResize(this.workspace)
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.tap !== nextProps.tap && nextProps.tap === TAP_CODE) {
            ScratchBlocks.svgResize(this.workspace);
            //TODO: 待优化，多语言有切换，才调用refreshWorkspace
            setTimeout(() => {
                this.props.vm.refreshWorkspace();
            }, 0)
        }
    }

    componentWillUnmount() {
        this.detachVM();
        this.workspace.dispose();
    }

    attachVM = () => {
        // Let vm listen the events from workspace, to maintain AST（blocks）of editingTarget
        this.workspace.addChangeListener(this.props.vm.blockListener);
        this.flyoutWorkspace = this.workspace.getFlyout().getWorkspace();
        this.flyoutWorkspace.addChangeListener(this.props.vm.flyoutBlockListener);
        this.flyoutWorkspace.addChangeListener(this.props.vm.monitorBlockListener);

        // When script running, yellow border appear
        // When stopped, yellow border disappear
        this.props.vm.addListener('SCRIPT_GLOW_ON', this.onScriptGlowOn);
        this.props.vm.addListener('SCRIPT_GLOW_OFF', this.onScriptGlowOff);
        this.props.vm.addListener('workspaceUpdate', this.onWorkspaceUpdate);
    };

    detachVM = () => {
        this.props.vm.removeListener('SCRIPT_GLOW_ON', this.onScriptGlowOn);
        this.props.vm.removeListener('SCRIPT_GLOW_OFF', this.onScriptGlowOff);
        this.props.vm.removeListener('workspaceUpdate', this.onWorkspaceUpdate);
    };

    onScriptGlowOn = (data) => {
        this.workspace.glowStack(data.id, true);
    };

    onScriptGlowOff = (data) => {
        this.workspace.glowStack(data.id, false);
    };

    // this.workspace.updateToolbox(toolboxXML);
    onWorkspaceUpdate = (data) => {
        // When we change sprites, update the toolbox to have the new sprite's blocks
        const toolboxXML = this.getToolboxXML();
        this.workspace.updateToolbox(toolboxXML);

        const dom = ScratchBlocks.Xml.textToDom(data.xml);
        ScratchBlocks.Xml.clearWorkspaceAndLoadFromXml(dom, this.workspace);
    };

    getToolboxXML = () => {
        // Use try/catch because this requires digging pretty deep into the VM
        // Code inside intentionally ignores several error situations (no stage, etc.)
        // Because they would get caught by this try/catch
        try {
            let {editingTarget: target, runtime} = this.props.vm;
            const stage = runtime.getTargetForStage();
            if (!target) target = stage; // If no editingTarget, use the stage

            const stageCostumes = stage.getCostumes();
            const targetCostumes = target.getCostumes();
            const targetSounds = target.getSounds();
            const dynamicBlocksXML = this.props.vm.runtime.getBlocksXML();
            return makeToolboxXML(false, target.isStage, target.id, dynamicBlocksXML,
                targetCostumes[0].name,
                stageCostumes[0].name,
                targetSounds.length > 0 ? targetSounds[0].name : ''
            );
        } catch (error) {
            return null;
        }
    };

    render() {
        // const { variableName, modalVisible } = this.state
        // const { onVariableNameChange, saveVariableName, toggleModal } = this.actions
        // const { t } = this.props

        return (
            <div style={{width: "100%", height: "100%"}} ref={this.blocks}>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {vm} = state.code;
    const {tap} = state.taps;
    return {
        vm,
        tap
    };
};

// const mapDispatchToProps = dispatch => ({
//     onActivateColorPicker: callback => dispatch(activateColorPicker(callback)),
//     onActivateCustomProcedures: (data, callback) => dispatch(activateCustomProcedures(data, callback)),
//     onOpenConnectionModal: id => {
//         dispatch(setConnectionModalExtensionId(id));
//         dispatch(openConnectionModal());
//     },
//     onOpenSoundRecorder: () => {
//         dispatch(activateTab(SOUNDS_TAB_INDEX));
//         dispatch(openSoundRecorder());
//     },
//     onRequestCloseExtensionLibrary: () => {
//         dispatch(closeExtensionLibrary());
//     },
//     onRequestCloseCustomProcedures: data => {
//         dispatch(deactivateCustomProcedures(data));
//     },
//     updateToolboxState: toolboxXML => {
//         dispatch(updateToolbox(toolboxXML));
//     },
//     updateMetrics: metrics => {
//         dispatch(updateMetrics(metrics));
//     }
// });

export default connect(mapStateToProps)(withTranslation()(Blocks));


