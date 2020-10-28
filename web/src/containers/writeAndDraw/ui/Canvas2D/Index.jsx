import React from 'react';
import styles from './styles.css';
import * as THREE from 'three';
import PrintablePlate from "./PrintablePlate.js"
import MouseController from '../../../../three-extensions/MouseController';
import {actions as writeAndDrawActions} from "../../../../reducers/writeAndDraw";
import {connect} from 'react-redux';

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
        this.printablePlate = new PrintablePlate(new THREE.Vector2(130, 120));
        this.group.add(this.printablePlate);
        window.addEventListener('resize', this.resizeWindow, false);

        setInterval(()=>{
            console.log(JSON.stringify(this.printablePlate.position))
        }, 1000)
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
                this.props.updateTransformation("x", x, false);
                this.props.updateTransformation("y", y, false);
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
        this.camera.position.copy(new THREE.Vector3(0, 0, 180));
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setClearColor(new THREE.Color(0xfafafa), 1);
        this.renderer.setSize(width, height);

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
    const {model} = state.writeAndDraw;
    return {
        tap,
        model
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setRendererParent: (modelsParent) => dispatch(writeAndDrawActions.setRendererParent(modelsParent)),
        selectModel: (model) => dispatch(writeAndDrawActions.selectModel(model)),
        updateTransformation: (key, value, preview) => dispatch(writeAndDrawActions.updateTransformation(key, value, preview)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);

