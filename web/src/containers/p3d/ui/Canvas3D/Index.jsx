import React from 'react';
import styles from './styles.css';
import * as THREE from 'three';
import MSRControls from '../../../../three-extensions/MSRControls';
import PrintableCube from './PrintableCube.jsx';
import {connect} from 'react-redux';
import IntersectDetector from "../../../../three-extensions/IntersectDetector";
import {actions as p3dModelActions} from "../../../../reducers/p3dModel";
import PrintablePlate from "./PrintablePlate";

// const SIZ = 220;

class Index extends React.Component {
    constructor(props) {
        super(props);

        this.node = React.createRef();

        // three
        this.camera = null;
        this.renderer = null;
        this.scene = null;
        this.group = null;

        this.modelGroup = null; // 所有Model3D的parent
        this.gcodeGroup = null; // gcode obj3d的parent

        //controls
        this.msrControls = null; // pan/scale/rotate print area

        // this.this = new THREE.Vector3(SIZ, SIZ, SIZ)
        this.size = new THREE.Vector3(450, 260, 300)
        // this.printableArea = new PrintableCube(this.size);
        this.printableArea = new PrintablePlate(new THREE.Vector2(this.size.x, this.size.y));
        this.printableArea.rotation.x = Math.PI / 2;
    }

    state = {};

    componentDidMount() {
        this.setupThree();
        this.setupIntersectDetector();
        this.setupMSRControls();

        this.props.setRendererParent4model(this.modelGroup);
        this.props.setRendererParent4gcode(this.gcodeGroup);

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
            this.camera,
            this.renderer.domElement,
            this.modelGroup.children,
            false
        );
        // triggered when "left mouse down on model"
        this.intersectDetector.addEventListener(
            'detected',
            (event) => {
                //detect到的是model2d的children
                const model = event.object;
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

    /**
     * 位置说明：
     * PrintableCube边长为size
     * PrintableCube的底板，position.y = 0
     * 为了正对着PrintableCube，因此camera.position.y = size/2，lookAt同理
     */
    setupThree() {
        const width = this.getVisibleWidth();
        const height = this.getVisibleHeight();

        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
        // this.camera.position.copy(new THREE.Vector3(0, this.size.y / 2, 450));
        this.camera.position.copy(new THREE.Vector3(0, 150, 500));
        this.camera.lookAt(new THREE.Vector3(0, 150, 0));
        // this.camera.lookAt(new THREE.Vector3(0, this.size.y / 2, 0));

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setClearColor(new THREE.Color(0xfafafa), 1);
        this.renderer.setSize(width, height);
        // this.renderer.shadowMap.enabled = true;

        this.scene = new THREE.Scene();
        this.scene.add(this.camera);
        this.scene.add(new THREE.HemisphereLight(0x000000, 0xe0e0e0));

        this.group = new THREE.Group();
        this.group.position.copy(new THREE.Vector3(0, 0, 0));

        this.modelGroup = new THREE.Group();
        this.gcodeGroup = new THREE.Group();

        //结构：scene--group--modelGroup--models
        //因为需要IntersectDetector去检测modelGroup.children
        this.group.add(this.modelGroup);
        this.group.add(this.gcodeGroup);
        this.scene.add(this.group);

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
    const {tap} = state.taps;
    return {
        tap
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setRendererParent4model: (parent) => dispatch(p3dModelActions.setRendererParent4model(parent)),
        setRendererParent4gcode: (parent) => dispatch(p3dModelActions.setRendererParent4gcode(parent)),
        selectModel: (model) => dispatch(p3dModelActions.selectModel(model)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
