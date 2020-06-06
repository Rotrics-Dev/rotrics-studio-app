import React from 'react';
import styles from './styles.css';
import * as THREE from 'three';
import MSRControls from '../../../../three-extensions/MSRControls';
import PrintableCube from './PrintableCube.jsx';
import p3dModelManager from "../../lib/p3dModelManager";
import {connect} from 'react-redux';
import IntersectDetector from "../../../../three-extensions/IntersectDetector";
import {actions as p3dModelActions} from "../../../../reducers/p3dModel";
import {actions as laserActions} from "../../../../reducers/laser";

//暂时只支持一个模型吧
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
        this.msrControls = null; // pan/scale/rotate print area

        this.size = new THREE.Vector3(150, 150, 150)
        this.printableArea = new PrintableCube(this.size);
    }

    state = {};

    componentDidMount() {
        this.setupThree();
        this.setupIntersectDetector();
        this.setupMSRControls();
        this.props.setModelsParent(this.modelGroup);
        this.animate();
        this.group.add(this.printableArea);
        window.addEventListener('resize', this.resizeWindow, false);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.tap !== nextProps.tap) {
            this.resizeWindow();
        }
    }

    setupIntersectDetector() {
        // only detect 'this.modelGroup.children'
        this.intersectDetector = new IntersectDetector(
            this.modelGroup.children,
            this.camera,
            this.renderer.domElement
        );
        // triggered when "left mouse down on model"
        this.intersectDetector.addEventListener(
            'detected',
            (event) => {
                //detect到的是model2d的children
                const model = event.object;
                console.log("detected: " + model)
                this.props.selectModel(model);
                // this.panControls.select(model);
            }
        );
    }

    setupMSRControls() {
        this.msrControls = new MSRControls(this.group, this.camera, this.renderer.domElement, this.size);
        // triggered first, when "mouse down on canvas"
        this.msrControls.addEventListener(
            'mouseDown',
            () => {
                // console.log("mouseDown")
                // this.controlMode = 'none';
            }
        );
        // triggered last, when "mouse up on canvas"
        this.msrControls.addEventListener(
            'moveStart',
            () => {
                // console.log("moveStart")
                // this.controlMode = 'msr';
            }
        );
        this.msrControls.addEventListener(
            'move',
            () => {
                // console.log("move")
                // this.updateTransformControl2D();
            }
        );
        // triggered last, when "mouse up on canvas"
        this.msrControls.addEventListener(
            'mouseUp',
            (eventWrapper) => {
                // console.log("mouseUp")
                // switch (eventWrapper.event.button) {
                //     case THREE.MOUSE.LEFT:
                //         if (this.controlMode === 'none') {
                //             this.transformControls && this.transformControls.detach(); // make axis invisible
                //             this.onUnselectAllModels();
                //         }
                //         break;
                //     case THREE.MOUSE.MIDDLE:
                //     case THREE.MOUSE.RIGHT:
                //         if (this.controlMode !== 'none') {
                //             eventWrapper.event.stopPropagation();
                //         }
                //         break;
                //     default:
                //         break;
                // }
                // this.controlMode = 'none';
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

        this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
        this.camera.position.copy(new THREE.Vector3(0, 50, 200));
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setClearColor(new THREE.Color(0xfafafa), 1);
        this.renderer.setSize(width, height);
        // this.renderer.shadowMap.enabled = true;

        this.scene = new THREE.Scene();
        this.scene.add(this.camera);

        this.group = new THREE.Group();
        this.modelGroup = new THREE.Group();

        //结构：scene--group--modelGroup--models
        //因为需要IntersectDetector去检测modelGroup.children
        this.group.add(this.modelGroup);
        this.scene.add(this.group);

        this.scene.add(new THREE.HemisphereLight(0x000000, 0xf0f0f0));

        this.node.current.appendChild(this.renderer.domElement);
    }

    animate = () => {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate);
    };

    getVisibleWidth() {
        return this.node.current.parentElement.clientWidth;
    }

    getVisibleHeight() {
        return this.node.current.parentElement.clientHeight;
    }

    render() {
        return (
            <div
                ref={this.node}
            />
        )
    }
}

const mapStateToProps = (state) => {
    const {tap} = state.tap;
    return {
        tap
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setModelsParent: (modelsParent) => dispatch(p3dModelActions.setModelsParent(modelsParent)),
        selectModel: (model) => dispatch(p3dModelActions.selectModel(model)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
