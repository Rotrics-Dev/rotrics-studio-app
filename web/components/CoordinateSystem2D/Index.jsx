import React from 'react';
import styles from './styles.css';
import * as THREE from 'three';
import PrintablePlate from "./PrintablePlate.js"

class Index extends React.Component {
    constructor(props) {
        super(props);

        this.node = React.createRef();

        // three
        this.camera = null;
        this.renderer = null;
        this.scene = null;
        this.group = null;
    }

    state = {
        current: "basic" // basic, function, g-code
    };

    componentDidMount() {
        this.setupThree();
        this.animate();
        this.setupZoom();

        this.group.add(new PrintablePlate(new THREE.Vector2(100, 100)));

        window.addEventListener('resize', this.resizeWindow, false);
    }

    resizeWindow = () => {
        const width = this.getVisibleWidth();
        const height = this.getVisibleHeight();

        console.log("width: " + this.getVisibleWidth())
        console.log("height: " + this.getVisibleHeight())
        console.log("--------------")

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
        this.scene.add(this.group);

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
