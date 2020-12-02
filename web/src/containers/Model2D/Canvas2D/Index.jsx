import React from 'react';
import * as THREE from 'three';
import PrintablePlate from "./PrintablePlate.js"
import IntersectDetector from '../../../three-extensions/IntersectDetector';
import PanControls from '../../../three-extensions/PanControls';

//props: tap, model, modelParent
class Index extends React.Component {
    constructor(props) {
        super(props);
        this.node = React.createRef();
        // three
        this.camera = null;
        this.renderer = null;
        this.scene = null;
        this.group = null;
        this.modelParent = null;
        //controls
        this.intersectDetector = null; // detect the intersected model with mouse
        this.panControls = null;
    }

    componentDidMount() {
        this.setupThree();
        this.setupZoom();
        this.setupIntersectDetector();
        this.setupPanControls();

        this.animate();
        this.group.add(new PrintablePlate(new THREE.Vector2(150, 120)));
        window.addEventListener('resize', this.resizeWindow, false);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.tap !== nextProps.tap) {
            this.resizeWindow();
        }
        if (!nextProps.model) {
            this.panControls.select(null);
        }
    }

    setupIntersectDetector() {
        // recursive detect 'this.modelParent.children'
        this.intersectDetector = new IntersectDetector(
            this.camera,
            this.renderer.domElement,
            this.modelParent.children,
            true
        );
        // triggered when "left mouse down on modelw"
        this.intersectDetector.addEventListener(
            'detected',
            (event) => {
                //detect到的是model2d的children
                const model = event.object.parent;
                model.setSelected(true);
                this.panControls.select(model);
            }
        );
    }

    setupPanControls() {
        this.panControls = new PanControls(this.camera, this.renderer.domElement);
        // this.group.add(this.panControls);

        this.panControls.addEventListener(
            'panning',
            (event) => {
                // 比较卡
                // const {x, y} = event.object.position;
                // this.props.updateTransformation("x", x, false)
                // this.props.updateTransformation("y", y, false)
            }
        );

        this.panControls.addEventListener(
            'pan-end',
            (event) => {
                const {x, y} = event.object.position;
                this.props.model.updateTransformation('x', x, false);
                this.props.model.updateTransformation('y', y, false);
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
        this.modelParent = this.props.modelParent;

        //结构：scene--group--modelParent--models
        //因为需要IntersectDetector去检测modelParent.children
        this.scene.add(this.group);
        this.group.add(this.modelParent);

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

    setupZoom() {
        const mousewheel = (e) => {
            e.preventDefault();
            //e.stopPropagation();
            const delta = 3;
            let z = this.camera.position.z;
            if (e.wheelDelta) {  //判断浏览器IE，谷歌滑轮事件
                if (e.wheelDelta > 0) { //当滑轮向上滚动时
                    z -= delta;
                }
                if (e.wheelDelta < 0) { //当滑轮向下滚动时
                    z += delta;
                }
            } else if (e.detail) {  //Firefox滑轮事件
                if (e.detail > 0) { //当滑轮向上滚动时
                    z -= delta;
                }
                if (e.detail < 0) { //当滑轮向下滚动时
                    z += delta;
                }
            }
            this.camera.position.z = z;
            this.camera.updateProjectionMatrix();
        };

        this.renderer.domElement.addEventListener('mousewheel', mousewheel, false);
    }

    render() {
        return (
            <div ref={this.node}/>
        )
    }
}

export default Index;

