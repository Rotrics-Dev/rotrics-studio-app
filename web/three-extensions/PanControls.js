import * as THREE from 'three';
import ThreeUtils from './ThreeUtils';

/**
 * 当年写的ThreeUtils真好用
 * 复杂坐标转换的一个解决思路：全部以世界坐标为参考系
 */
class PanControls extends THREE.Object3D {
    constructor(camera, domElement) {
        super();
        this.camera = camera;
        this.domElement = domElement;
        this.object = null; // selected object
        this.raycaster = new THREE.Raycaster();

        this.panning = false;
        this.panPosStart = new THREE.Vector3();
        this.panPosEnd = new THREE.Vector3();
        this.panPosDelta = new THREE.Vector3();

        this.addListeners();
    }

    addListeners() {
        this.domElement.addEventListener('mousedown', (event) => {
            this.onMouseDown(event)
        });

        this.domElement.addEventListener('mousemove', (event) => {
            this.onMouseMove(event)
        });

        this.domElement.addEventListener('mouseup', (event) => {
            console.log("mouseup")
            this.onMouseUp(event)
        });

        //离开domElement时触发
        //TODO: 将来再处理
        this.domElement.addEventListener('mouseleave', (event) => {
            // console.log("mouseleave")
        });

        this.domElement.addEventListener('mouseout', (event) => {
            // console.log("mouseout")
        });
    }

    removeListeners() {
        this.domElement.removeEventListener('mousedown', () => {
            this.onMouseDown()
        });
    }

    dispose() {
        this.removeListeners();
    }

    //选中要pan的object
    select(object) {
        this.object = object;
    }

    onMouseDown(event) {
        if (!this.object) return;

        if (event.button === THREE.MOUSE.LEFT) {
            event.preventDefault();
            this.raycaster.setFromCamera(ThreeUtils.getMouseXY(event, this.domElement), this.camera);
            const intersects = this.raycaster.intersectObject(this.object, true);
            if (intersects.length > 0) {
                this.panning = true;
                this.panPosStart.copy(ThreeUtils.getEventWorldPosition(event, this.domElement, this.camera));
            }
        }
    }

    onMouseMove(event) {
        if (!this.object) return;

        if (event.button === THREE.MOUSE.LEFT) {
            event.preventDefault();

            this.raycaster.setFromCamera(ThreeUtils.getMouseXY(event, this.domElement), this.camera);
            const intersects = this.raycaster.intersectObject(this.object, true);
            this.domElement.style.cursor = (intersects.length > 0) ? 'move' : 'auto';

            if (this.panning) {
                this.panPosEnd.copy(ThreeUtils.getEventWorldPosition(event, this.domElement, this.camera));
                this.panPosDelta.subVectors(this.panPosEnd, this.panPosStart);
                const targetPos = ThreeUtils.getObjectWorldPosition(this.object).add(this.panPosDelta);
                ThreeUtils.setObjectWorldPosition(this.object, targetPos);
                this.panPosStart.copy(this.panPosEnd);

                this.dispatchEvent({type: 'panning', object: this.object});
            }
        }
    }

    onMouseUp(event) {
        if (!this.object) return;

        if (event.button === THREE.MOUSE.LEFT) {
            event.preventDefault();

            if (this.panning) {
                this.dispatchEvent({type: 'pan-end', object: this.object});
                this.panning = false;
                this.domElement.style.cursor = 'auto';
            }
        }
    }
}

export default PanControls;
