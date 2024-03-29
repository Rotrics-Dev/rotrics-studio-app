import * as THREE from 'three';
import ThreeUtils from './ThreeUtils';

/**
 * 当年写的ThreeUtils真好用
 * 复杂坐标转换的一个解决思路：全部以世界坐标为参考系
 */
class PanControls extends THREE.EventDispatcher {
    constructor(camera, domElement) {
        super();
        this.camera = camera;
        this.domElement = domElement;
        this.selectedObject = null; // selected object
        this.raycaster = new THREE.Raycaster();

        this.panning = false;
        this.panPosStart = new THREE.Vector3();
        this.panPosEnd = new THREE.Vector3();
        this.panPosDelta = new THREE.Vector3();

        this.addListeners();
    }

    addListeners() {
        this.domElement.addEventListener('mousedown', this.onMouseDown);
        this.domElement.addEventListener('mousemove', this.onMouseMove);
        this.domElement.addEventListener('mouseup', this.onMouseUp);
        this.domElement.addEventListener('contextmenu', this.onContextMenu);

        //TODO: 将来再处理
        // this.domElement.addEventListener('mouseleave', (event) => {
        // console.log("mouseleave")
        // });
        // this.domElement.addEventListener('mouseout', (event) => {
        // console.log("mouseout")
        // });
    }

    removeListeners() {
        this.domElement.removeEventListener('mousedown', this.onMouseDown);
        this.domElement.removeEventListener('mousemove', this.onMouseMove);
        this.domElement.removeEventListener('mouseup', this.onMouseUp);
        this.domElement.removeEventListener('contextmenu', this.onContextMenu);
    }

    dispose() {
        this.removeListeners();
        this.selectedObject = null;
    }

    //选中要pan的selectedObject
    select(selectedObject) {
        this.selectedObject = selectedObject;
    }

    onMouseDown = (event) => {
        if (!this.selectedObject) {
            return;
        }
        console.log(event.button)

        if (event.button === THREE.MOUSE.LEFT) {
            event.preventDefault();
            this.raycaster.setFromCamera(ThreeUtils.getMouseXY(event, this.domElement), this.camera);
            const intersects = this.raycaster.intersectObject(this.selectedObject, true);
            if (intersects.length > 0) {
                this.panning = true;
                this.panPosStart.copy(ThreeUtils.getEventWorldPosition(event, this.domElement, this.camera));
            }
        } else if (event.button === THREE.MOUSE.RIGHT) {
            // event.preventDefault();
            event.stopPropagation();

            console.log('event.button===THREE.MOUSE.RIGHT onMouseDown');
        }
    }

    onMouseMove = (event) => {
        console.log()
        if (!this.selectedObject) return;
        console.log(event.button)

        if (event.button === THREE.MOUSE.LEFT) {
            event.preventDefault();

            this.raycaster.setFromCamera(ThreeUtils.getMouseXY(event, this.domElement), this.camera);
            const intersects = this.raycaster.intersectObject(this.selectedObject, true);
            this.domElement.style.cursor = (intersects.length > 0) ? 'move' : 'auto';

            if (this.panning) {
                this.panPosEnd.copy(ThreeUtils.getEventWorldPosition(event, this.domElement, this.camera));
                this.panPosDelta.subVectors(this.panPosEnd, this.panPosStart);
                const targetPos = ThreeUtils.getObjectWorldPosition(this.selectedObject).add(this.panPosDelta);
                ThreeUtils.setObjectWorldPosition(this.selectedObject, targetPos);
                this.panPosStart.copy(this.panPosEnd);

                this.dispatchEvent({type: 'panning', object: this.selectedObject});
            }
            console.log('event.button===THREE.MOUSE.LEFT onMouseMove');

        } else if (event.button === THREE.MOUSE.RIGHT) {
            // event.preventDefault();
            event.stopPropagation();
            console.log('event.button===THREE.MOUSE.RIGHT onMouseMove');
        }
    }

    onMouseUp = (event) => {
        if (!this.selectedObject) return;
        console.log(event.button)

        event.preventDefault();

        if (event.button === THREE.MOUSE.LEFT) {
            event.preventDefault();

            if (this.panning) {
                this.dispatchEvent({type: 'pan-end', object: this.selectedObject});
                this.panning = false;
                this.domElement.style.cursor = 'auto';
            }
        } else if (event.button === THREE.MOUSE.RIGHT) {
            // event.preventDefault();
            event.stopPropagation();

            console.log('event.button===THREE.MOUSE.RIGHT onMouseUp');
        }
    }

    onContextMenu = (event) => {
        event.preventDefault();
    }
}

export default PanControls;
