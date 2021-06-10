import React from 'react';
import styles from './styles.css';
import * as THREE from 'three';
// 入口
import PrintablePlate from "./PrintablePlate.js"
import MouseController from '../../../../three-extensions/MouseController';
import {actions as writeAndDrawActions} from "../../../../reducers/writeAndDraw";
import {actions as laserActions} from "../../../../reducers/laser";
import {connect} from 'react-redux';
import {FRONT_END} from "../../../../utils/workAreaUtils";
import { getIsAdvance } from '../../../../utils'

/**
 * 在 Setting - Config增加 高级模式 - 使用滑轨进行绘画和激光雕刻
 * 绘画激光工作区
 * Three.js
 */
class Index extends React.Component {
    constructor(props) {
        super(props);
        this.node = React.createRef();

        // three
        this.camera = null;
        this.renderer = null;
        this.scene = null;
        this.group = null;
        this.modelGroup = null;

        //controls
        this.mouseController = null;
        this.printablePlate = null;

        // 渲染标记
        this.renderFlag = true
        this.renderTimer = null
    }

    componentDidMount() {
        this.setupThree();
        this.setupMouseController();
        this.props.setRendererParent(this.modelGroup);
        this.setRenderTimer()
        this.animate();
        this.printablePlate = new PrintablePlate(
            new THREE.Vector2(450, 260), 
            this.props.workHeight, 
            this.props.frontEnd,
            this.props.isBasic || false
        );
        this.group.add(this.printablePlate);
        window.addEventListener('resize', this.resizeWindow, false);

        // 添加监听
        window.addEventListener('click', this.setRenderTimer, false)
        window.addEventListener('keydown', this.setRenderTimer, false)
        window.addEventListener('wheel', this.setRenderTimer, false)
    }

    componentWillUnmount() {
        // 取消监听
        window.removeEventListener('click', this.setRenderTimer)
        window.removeEventListener('keydown', this.setRenderTimer)
        window.removeEventListener('keydown', this.setRenderTimer)
    }

    componentWillReceiveProps(nextProps) {
        // 当advance改变 => 重新加载工作区
        if (this.props.advance !== nextProps.advance) {
            // console.log('执行重新渲染')
            while(this.node.current.hasChildNodes()) {
                this.node.current.removeChild(this.node.current.firstChild);
            }

            this.setupThree();
            this.setupMouseController();
            this.props.setRendererParent(this.modelGroup);
            this.animate();
            this.printablePlate = new PrintablePlate(
                new THREE.Vector2(450, 260), 
                this.props.workHeight, 
                this.props.frontEnd,
                this.props.isBasic || false
            );
            this.group.add(this.printablePlate);
        }

        if (this.props.tap !== nextProps.tap) {
            this.resizeWindow();
        }
    }

    setupMouseController() {
        this.mouseController = new MouseController(this.camera, this.renderer.domElement, this.group, this.modelGroup.children);
        this.mouseController.addEventListener(
            'detected',
            (event) => {
                const model = event.object.parent;
                this.props.selectModel(model);
                this.mouseController.select(model);
            }
        );
        this.mouseController.addEventListener(
            'pan_object_end',
            (event) => {
                const {x, y} = event.object.position;
                this.props.updateTransformation("x", x, false)
                this.props.updateTransformation("y", y, false)
            }
        );
    }

    resizeWindow = () => {
        this.setRenderTimer()
        const width = this.getVisibleWidth();
        const height = this.getVisibleHeight();
        if (width * height !== 0) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
    };

    // 设置渲染定时器
    setRenderTimer = () => {
        if (this.renderTimer) {
            // console.log('渲染定时器运行中')
            return
        }

        // console.log('初始化渲染定时器')

        this.renderFlag = true
        this.renderTimer = setTimeout(() => {
            clearTimeout(this.renderTimer)
            this.renderTimer = null
            this.renderFlag = false
            // console.log('清除渲染定时器')
        }, 5000)
    }

    setupThree() {
        const width = this.getVisibleWidth();
        const height = this.getVisibleHeight();

        this.scene = new THREE.Scene();
        this.group = new THREE.Group();
        this.modelGroup = new THREE.Group();

        //结构：scene--group--modelGroup--models
        //便于检测modelGroup.children
        this.scene.add(this.group);
        this.group.add(this.modelGroup);

        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

        // 设置视觉中心，若开启高级模式则为0，否则为280
        const y = getIsAdvance() ? 0 : 280

        this.camera.position.copy(new THREE.Vector3(0, y, 150));
        this.camera.lookAt(new THREE.Vector3(0, y, 0));

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setClearColor(new THREE.Color(0xfafafa), 1);
        this.renderer.setSize(width, height);

        this.node.current.appendChild(this.renderer.domElement);
    }

    animate = () => {
        /**
         * 我们软件本身对帧率不敏感，这里选择降低一半的帧率，
         * 可以将18%的CPU占用降低到10%，GPU从30%降低到15%，
         */
        // console.log(`${this.renderFlag} ? ${'渲染'} : ${'不渲染'}`)
        this.renderFlag && this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate);
    };

    getVisibleWidth() {
        return this.node.current.parentElement.clientWidth;
    }

    getVisibleHeight() {
        return this.node.current.parentElement.clientHeight;
    }

    render() {
        const { workHeight } = this.props
        if (this.workHeight !== workHeight) {
            if (this.printablePlate) this.printablePlate.setUpWorkArea(workHeight)
            this.workHeight = workHeight
        }
        return (
            <div
                ref={this.node}
            />
        )
    }
}

const Canvas2dPen = connect(
    (state) => {
        const {workHeightPen, advance} = state.persistentData
        const {tap} = state.taps;
        const {model} = state.writeAndDraw;
        return {
            model,
            tap,
            workHeight: workHeightPen,
            frontEnd: FRONT_END.PEN,
            advance
        };
    },
    (dispatch) => {
        return {
            setRendererParent: (modelsParent) => dispatch(writeAndDrawActions.setRendererParent(modelsParent)),
            selectModel: (model) => dispatch(writeAndDrawActions.selectModel(model)),
            updateTransformation: (key, value, preview) => dispatch(writeAndDrawActions.updateTransformation(key, value, preview)),
        };
    }
)(Index);

const Canvas2dLaser = connect(
    (state) => {
        const {workHeightLaser, advance} = state.persistentData
        const {tap} = state.taps;
        const {model} = state.laser;
        return {
            model,
            tap,
            workHeight: workHeightLaser,
            frontEnd: FRONT_END.LASER,
            advance
        };
    },
    (dispatch) => {
        return {
            setRendererParent: (modelsParent) => dispatch(laserActions.setRendererParent(modelsParent)),
            selectModel: (model) => dispatch(laserActions.selectModel(model)),
            updateTransformation: (key, value, preview) => dispatch(laserActions.updateTransformation(key, value, preview)),
        };
    }
)(Index);
export default Canvas2dPen
export {Canvas2dPen, Canvas2dLaser}