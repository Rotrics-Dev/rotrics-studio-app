import React from 'react';
import styles from './styles.css';
import * as THREE from 'three';
import PrintablePlate from "./PrintablePlate.js"
import laserManager from "../../manager/laserManager.js";
import IntersectDetector from '../../three-extensions/IntersectDetector';

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
        this.intersectDetector = null; // detect the intersected model with mouse
    }

    state = {
        current: "basic" // basic, function, g-code
    };

    componentDidMount() {
        this.setupThree();
        laserManager.setModelsParent(this.modelGroup);
        this.setupZoom();
        this.setupIntersectDetector();
        this.animate();
        this.group.add(new PrintablePlate(new THREE.Vector2(100, 100)));
        window.addEventListener('resize', this.resizeWindow, false);
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
                console.log("detected")
                const model = event.object;
                laserManager.selectModel(model)
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
        //因为需要IntersectDetector去检测modelGroup.children
        this.scene.add(this.group);
        this.group.add(this.modelGroup);


        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.copy(new THREE.Vector3(0, 0, 200));
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
            <div
                ref={this.node}
            />
        )
    }
}

export default Index;
