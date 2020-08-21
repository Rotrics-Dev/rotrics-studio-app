/* eslint-disable */
/**
 * 移动过程中删除模型怎么解决
 */
import * as THREE from 'three';
import ThreeUtils from "./ThreeUtils";

const ACTIONS = {
    NONE: 0,//无

    PAN_OBJECT: 1,//模型平移
    PAN_CAMERA: 2,//相机平移
    ROTATE_CAMERA: 3,//旋转相机

    SCALE_OBJECT_X: 4,//模型指定轴缩放
    SCALE_OBJECT_Y: 5,
    SCALE_OBJECT_Z: 6,
    SCALE_OBJECT_X_Y: 7,
    SCALE_OBJECT_X_Y_Z: 8,

    ROTATE_OBJECT_X: 9,//模型指定轴旋转
    ROTATE_OBJECT_Y: 10,
    ROTATE_OBJECT_Z: 11,
}

/* 设置鼠标游标样式
            this.domElement.style.cursor = 'auto';
            this.domElement.style.cursor = (intersects.length > 0) ? 'move' : 'auto';
            this.domElement.style.cursor = 'auto';
*/
class MouseController extends THREE.EventDispatcher {
    /**
     *
     * @param camera
     * @param domElement
     * @param group
     * @param objects
     * @param recursiveDetect 是否递归检测 objects 中元素的children
     */
    constructor(camera, domElement, group, objects, recursiveDetect = false) {
        super();
        this.camera = camera;
        this.domElement = domElement;
        this.group = group;
        this.objects = objects;
        this.recursiveDetect = recursiveDetect;
        this.raycaster = new THREE.Raycaster();

        this.panning = false;

        // this.detectedObject = null;
        this.selectedObject = null;
        this.action = ACTIONS.NONE;//当前鼠标动作
        this.anchorPosition = null;//当前缩放锚点

        this.startWorldPosition = new THREE.Vector3();
        this.endWordPosition = new THREE.Vector3();
        this.deltaWordPosition = new THREE.Vector3();
        this.addListeners();
    }


    addListeners() {
        this.domElement.addEventListener('mousedown', this.onMouseDown);
        this.domElement.addEventListener('mousemove', this.onMouseMove);
        this.domElement.addEventListener('mouseup', this.onMouseUp);
        this.domElement.addEventListener('contextmenu', this.onContextMenu);
        this.domElement.addEventListener('mousewheel', this.onMouseWheel);
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
        this.domElement.removeEventListener('mousewheel', this.onMouseWheel);
    }

    //选中要pan的selectedObject
    select(selectedObject) {
        this.selectedObject = selectedObject;
    }

    dispose() {
        this.removeListeners();
    }

    onMouseDown = (event) => {
        event.preventDefault();
        console.log('MouseController_onMouseDown')
        this.startWorldPosition.copy(ThreeUtils.getEventWorldPosition(event, this.domElement, this.camera));
        if (event.button === THREE.MOUSE.LEFT) {
            if (this.handleObjectSelection(event)) {
                this.handleObjectActionStart(event);
            } else {
                // this.action = ACTIONS.ROTATE_CAMERA;//旋转camera
            }

        } else if (event.button === THREE.MOUSE.RIGHT) {
            this.action = ACTIONS.PAN_CAMERA;
        }
    };

    onMouseMove = (event) => {
        event.preventDefault();

        this.handleMouseCursor(event);

        if (this.action === ACTIONS.NONE)
            return;

        switch (this.action) {
            case  ACTIONS.PAN_OBJECT :
                this.handlePanObject(event);
                break;
            case  ACTIONS.PAN_CAMERA :
                this.handlePanCamera(event);
                break;
            case  ACTIONS.ROTATE_CAMERA :
                break;
            case  ACTIONS.SCALE_OBJECT_X :
                break;
            case  ACTIONS.SCALE_OBJECT_Y :
                break;
            case  ACTIONS.SCALE_OBJECT_Z :
                break;
            case  ACTIONS.SCALE_OBJECT_X_Y :
                break;
            case  ACTIONS.SCALE_OBJECT_X_Y_Z :
                break;
            case  ACTIONS.ROTATE_OBJECT_X :
                break;
            case  ACTIONS.ROTATE_OBJECT_Y :
                break;
            case  ACTIONS.ROTATE_OBJECT_Z :
                break;
        }
    }

    onMouseUp = (event) => {
        this.onMouseMove(event);
        if (this.action === ACTIONS.PAN_OBJECT) {
            this.dispatchEvent({type: 'pan_object_end', object: this.selectedObject});
        }
        this.action = ACTIONS.NONE;
    }

    onContextMenu = (event) => {
        event.preventDefault();
    }

    onMouseWheel = (event) => {
        event.preventDefault();
        const delta = 10;
        let z = this.camera.position.z;
        if (event.wheelDelta) {  //判断浏览器IE，谷歌滑轮事件
            if (event.wheelDelta > 0) { //当滑轮向上滚动时
                z -= delta;
            }
            if (event.wheelDelta < 0) { //当滑轮向下滚动时
                z += delta;
            }
        } else if (e.detail) {  //Firefox滑轮事件
            if (event.detail > 0) { //当滑轮向上滚动时
                z -= delta;
            }
            if (event.detail < 0) { //当滑轮向下滚动时
                z += delta;
            }
        }
        if (z <= 500 && z >= 30) {//限制缩放范围
            this.camera.position.z = z;
            this.camera.updateProjectionMatrix();
        }
    };

    handleMouseCursor(event) {
        this.raycaster.setFromCamera(ThreeUtils.getMouseXY(event, this.domElement), this.camera);
        const intersects = this.raycaster.intersectObjects(this.objects, true);
        this.domElement.style.cursor = (intersects.length > 0 || this.action !== ACTIONS.NONE) ? 'move' : 'auto';
    }

    /**
     * @param event
     * @returns {boolean} if it had selected any object。
     */
    handleObjectSelection(event) {
        this.raycaster.setFromCamera(ThreeUtils.getMouseXY(event, this.domElement), this.camera);
        const intersects = this.raycaster.intersectObjects(this.objects, true);
        if (intersects.length > 0) {
            this.dispatchEvent({type: 'detected', object: intersects[0].object});//发送选中状态
            return true;
        }
        return false;
    }

    /**
     *后期有各种锚点缩放操作可以在这里分发一下
     *处理模型相关的事件
     */
    handleObjectActionStart(event) {
        this.startWorldPosition.copy(ThreeUtils.getEventWorldPosition(event, this.domElement, this.camera));
        this.action = ACTIONS.PAN_OBJECT;//
    }

    handlePanObject(event) {
        if (!this.selectedObject) return;
        this.endWordPosition.copy(ThreeUtils.getEventWorldPosition(event, this.domElement, this.camera));
        this.deltaWordPosition.subVectors(this.endWordPosition, this.startWorldPosition);
        const targetWordPosition = ThreeUtils.getObjectWorldPosition(this.selectedObject).add(this.deltaWordPosition);
        ThreeUtils.setObjectWorldPosition(this.selectedObject, targetWordPosition);
        this.startWorldPosition.copy(this.endWordPosition);
        this.dispatchEvent({type: 'panning', object: this.selectedObject});
    }

    /**
     * actually it pan the whole baseModel
     * @param event
     */
    handlePanCamera(event) {
        this.endWordPosition.copy(ThreeUtils.getEventWorldPosition(event, this.domElement, this.camera));
        this.deltaWordPosition.subVectors(this.endWordPosition, this.startWorldPosition);
        this.group.position.add(new THREE.Vector3(this.deltaWordPosition.x, this.deltaWordPosition.y));
        this.startWorldPosition.copy(this.endWordPosition);
    }
}


export default MouseController;
