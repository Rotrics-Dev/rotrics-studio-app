import React from 'react';
import styles from './styles.css';
import * as THREE from 'three';
import PrintablePlate from "./PrintablePlate.js"
import MouseController from '../../../../three-extensions/MouseController';
import {actions as writeAndDrawActions} from "../../../../reducers/writeAndDraw";
import {actions as laserActions} from "../../../../reducers/laser";
import {connect} from 'react-redux';
import {FRONT_END} from "../../../../utils/workAreaUtils";

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
    }

    componentDidMount() {
        this.setupThree();
        this.setupMouseController();
        this.props.setRendererParent(this.modelGroup);
        this.animate();
        this.printablePlate = new PrintablePlate(new THREE.Vector2(450, 260), this.props.workHeight, this.props.frontEnd);
        this.group.add(this.printablePlate);
        window.addEventListener('resize', this.resizeWindow, false);
    }

    componentWillReceiveProps(nextProps) {
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
        const width = this.getVisibleWidth();
        const height = this.getVisibleHeight();
        if (width * height !== 0) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
    };

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
        this.camera.position.copy(new THREE.Vector3(0, 280, 150));
        this.camera.lookAt(new THREE.Vector3(0, 280, 0));

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setClearColor(new THREE.Color(0xfafafa), 1);
        this.renderer.setSize(width, height);

        this.node.current.appendChild(this.renderer.domElement);
    }

    renderFlag = true;
    animate = () => {
        if (this.renderFlag)//我们软件本身对帧率不敏感，这里选择降低一半的帧率，可以将                18%的CPU占用降低到10%，GPU从30%降低到15%，
            this.renderer.render(this.scene, this.camera);
        this.renderFlag = !this.renderFlag;
        requestAnimationFrame(this.animate);
    };

    getVisibleWidth() {
        return this.node.current.parentElement.clientWidth;
    }

    getVisibleHeight() {
        return this.node.current.parentElement.clientHeight;
    }

    render() {
        const {workHeightPen} = this.props
        if (this.workHeightPen !== workHeightPen) {
            if (this.printablePlate)
                this.printablePlate.setUpWorkArea(workHeightPen)
            this.workHeightPen = workHeightPen
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
        const {workHeightPen} = state.persistentData
        const {tap} = state.taps;
        const {model} = state.writeAndDraw;
        return {
            model,
            tap,
            workHeight: workHeightPen,
            frontEnd: FRONT_END.PEN
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
        const {workHeightLaser} = state.persistentData
        const {tap} = state.taps;
        const {model} = state.laser;
        return {
            model,
            tap,
            workHeight: workHeightLaser,
            frontEnd: FRONT_END.LASER
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