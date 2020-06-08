import events from "events";
import * as THREE from 'three';

class P3DModelManager extends events.EventEmitter {
    constructor() {
        super();
        this.modelsParent = null;
        this._selected = null;
    }

    //设置模型要展示在哪个object3d上
    setModelsParent(object3d) {
        this.modelsParent = object3d;
    }

    addModel(model) {
        const xz = this._computeAvailableXZ(model);
        model.position.x = xz.x;
        model.position.z = xz.z;

        this.modelsParent.add(model);
        this.selectModel(model);
    }

    selectModel(model3d) {
        if (this._selected === model3d) {
            return;
        }
        this._selected = model3d;
        for (const child of this.modelsParent.children) {
            child.setSelected(this._selected === child);
        }
        this.emit('onChangeModel', this._selected);
    }

    removeSelected() {
        if (this._selected) {
            this.modelsParent.remove(this._selected);
            this._selected = null;
            this.emit('onChangeModel', null);
        }
    }

    removeAll() {
        this.modelsParent.remove(...this.modelsParent.children);
        this._selected = null;
        this.emit('onChangeModel', null);
    }

    duplicateSelected() {
        if (this._selected) {
            const model3d = this._selected.clone();
            this.addModel(model3d)
        }
    }

    layFlat(){
        if (this._selected) {
            this._selected.layFlat();
            this.emit('onChangeTransformation', this._selected.transformation);
        }
    }

    updateTransformation(key, value) {
        //todo: 根据updateTransformation返回值，来确定是否需要emmit
        this._selected.updateTransformation(key, value);
        this.emit('onChangeTransformation', this._selected.transformation);
    }

    afterUpdateTransformation(key, value) {
        //todo: 根据updateTransformation返回值，来确定是否需要emmit
        this._selected.updateTransformation(key, value);
        this._selected.stickToPlate();
        this.emit('onChangeTransformation', this._selected.transformation);
    }

    _computeAvailableXZ(model) {
        if (this.modelsParent.children === 0) {
            return { x: 0, z: 0 };
        }
        model.computeBoundingBox();
        const modelBox3 = model.boundingBox;
        const box3Arr = [];
        for (const model of this.modelsParent.children) {
            model.computeBoundingBox();
            box3Arr.push(model.boundingBox);
        }

        const length = 65;
        const step = 5; // min distance of models &
        const y = 1;
        for (let stepCount = 1; stepCount < length / step; stepCount++) {
            // check the 4 positions on x&z axis first
            const positionsOnAxis = [
                new THREE.Vector3(0, y, stepCount * step),
                new THREE.Vector3(0, y, -stepCount * step),
                new THREE.Vector3(stepCount * step, y, 0),
                new THREE.Vector3(-stepCount * step, y, 0)
            ];
            // clock direction
            const p1 = new THREE.Vector3(stepCount * step, y, stepCount * step);
            const p2 = new THREE.Vector3(stepCount * step, y, -stepCount * step);
            const p3 = new THREE.Vector3(-stepCount * step, y, -stepCount * step);
            const p4 = new THREE.Vector3(-stepCount * step, y, stepCount * step);
            const positionsOnSquare = this._getCheckPositions(p1, p2, p3, p4, step);
            const checkPositions = [].concat(positionsOnAxis);
            // no duplicates
            for (const item of positionsOnSquare) {
                if (!(item.x === 0 || item.z === 0)) {
                    checkPositions.push(item);
                }
            }

            // {
            //     const geometry = new THREE.Geometry();
            //     for (const vector3 of checkPositions) {
            //         geometry.vertices.push(vector3);
            //     }
            //     const material = new THREE.PointsMaterial({ color: 0xff0000 });
            //     const points = new THREE.Points(geometry, material);
            //     points.position.y = -1;
            //     this.add(points);
            // }

            for (const position of checkPositions) {
                const modelBox3Clone = modelBox3.clone();
                modelBox3Clone.translate(new THREE.Vector3(position.x, 0, position.z));
                // if (modelBox3Clone.min.x < this._bbox.min.x ||
                //     modelBox3Clone.max.x > this._bbox.max.x ||
                //     modelBox3Clone.min.z < this._bbox.min.z ||
                //     modelBox3Clone.max.z > this._bbox.max.z) {
                //     continue;
                // }
                if (!this._isBox3IntersectOthers(modelBox3Clone, box3Arr)) {
                    return { x: position.x, z: position.z };
                }
            }
        }
        return { x: 0, z: 0 };
    }

    _getPositionBetween(p1, p2, step) {
        const positions = [];
        if (p1.x !== p2.x) {
            const z = p1.z;
            const minX = Math.min(p1.x, p2.x) + step;
            const maxX = Math.max(p1.x, p2.x);
            for (let x = minX; x < maxX; x += step) {
                positions.push(new THREE.Vector3(x, 1, z));
            }
        } else if (p1.z !== p2.z) {
            const x = p1.x;
            const minZ = Math.min(p1.z, p2.z) + step;
            const maxZ = Math.max(p1.z, p2.z);
            for (let z = minZ; z < maxZ; z += step) {
                positions.push(new THREE.Vector3(x, 1, z));
            }
        }
        return positions;
    }

    _getCheckPositions(p1, p2, p3, p4, step) {
        const arr1 = this._getPositionBetween(p1, p2, step);
        const arr2 = this._getPositionBetween(p2, p3, step);
        const arr3 = this._getPositionBetween(p3, p4, step);
        const arr4 = this._getPositionBetween(p4, p1, step);
        return [p1].concat(arr1, [p2], arr2, [p3], arr3, arr4, [p4]);
    }

    _isBox3IntersectOthers(box3, box3Arr) {
        // check intersect with other box3
        for (const otherBox3 of box3Arr) {
            if (box3.intersectsBox(otherBox3)) {
                return true;
            }
        }
        return false;
    }
}

const p3dModelManager = new P3DModelManager();

export default p3dModelManager;

