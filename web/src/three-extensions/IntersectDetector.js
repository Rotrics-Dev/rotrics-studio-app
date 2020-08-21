/* eslint-disable */

/**
 * @author walker https://github.com/liumingzw
 */

import * as THREE from 'three';

class IntersectDetector extends THREE.EventDispatcher {
    /**
     *
     * @param camera
     * @param domElement
     * @param objects
     * @param recursiveDetector 是否递归检测objects中元素的children
     */
    constructor(camera, domElement, objects, recursiveDetect = false) {
        super();
        this.camera = camera;
        this.domElement = domElement;
        this.objects = objects;
        this.recursiveDetect = recursiveDetect;
        this.enabled = true;
        this.raycaster = new THREE.Raycaster();

        this.addListeners();
    }

    addListeners() {
        this.domElement.addEventListener('mousedown', this.onMouseDown, false);
    }

    removeListeners() {
        this.domElement.removeEventListener('mousedown', this.onMouseDown, false);
    }

    onMouseDown = (event) => {
        if (this.enabled === false) return;
        // only detect when left-mouse-down
        if (event.button === THREE.MOUSE.LEFT) {
            event.preventDefault();
            this.raycaster.setFromCamera(this.getMousePosition(event), this.camera);
            const intersects = this.raycaster.intersectObjects(this.objects, this.recursiveDetect);
            console.log(this.objects.length)
            console.log(intersects.length)
            if (intersects.length > 0) {
                const detectedObject = intersects[0].object;
                this.dispatchEvent({type: 'detected', object: detectedObject});
            }
        }
    };

    getMousePosition(event) {
        const rect = this.domElement.getBoundingClientRect();
        return new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        )
    }

    dispose() {
        this.removeListeners();
    }
}


export default IntersectDetector;
