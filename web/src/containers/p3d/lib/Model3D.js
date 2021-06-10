import * as THREE from 'three';

const materialNormal = new THREE.MeshPhongMaterial({color: 0xa0a0a0, specular: 0xb0b0b0, shininess: 30});
const materialSelected = new THREE.MeshPhongMaterial({
    color: 0xb0b0b0,
    shininess: 30,
    transparent: true,
    opacity: 0.6,
    depthTest: false
});
const materialTransparent = new THREE.MeshPhongMaterial({
    color: 0xb0b0b0,
    shininess: 30,
    transparent: true,
    opacity: 0.1,
    depthTest: false
});

class Model3D extends THREE.Mesh {
    constructor(bufferGeometry, convexBufferGeometry, modelName, modelPath) {
        super(bufferGeometry, materialNormal);

        this.boundingBox = null; // the boundingBox is aligned parent axis

        this.bufferGeometry = bufferGeometry;
        this.convexBufferGeometry = convexBufferGeometry;
        this.modelName = modelName;
        this.modelPath = modelPath;

        this.isSelected = false;
        this.mode = 'prepare';

        /**
         * this.convexBufferGeometry is from BufferGeometry.fromGeometry()
         * source code: https://github.com/mrdoob/three.js/blob/master/src/core/BufferGeometry.js
         * seen at: File3dToGeometry.worker.js
         * so this.convexBufferGeometry must be non-indexed
         *
         * Access to faces in BufferGeometry: https://stackoverflow.com/questions/42141438/access-to-faces-in-buffergeometry
         */
        this.convexGeometry = new THREE.Geometry();
        this.convexGeometry.fromBufferGeometry(convexBufferGeometry);
        this.convexGeometry.mergeVertices();

        this.transformation = {
            // xyz位置
            x: 0,
            y: 300,
            z: 0,
            // xyz选择
            rx: 0,
            ry: 0,
            rz: 0,
            scale: 1,
            // xyz缩放
            sx: 1,
            sy: 1,
            sz: 1,
            // 原始缩放尺寸
            ogScaleWidth: 0,
            ogScaleHeight: 0,
            ogScaleDepth: 0,
            // 缩放尺寸
            scaleWidth: 0,
            scaleHeight: 0,
            scaleDepth: 0,
            // 
            isUniformScaling: true
        };
        this.position.x = 0;
        this.position.z = -300;

        let cubeEdges = new THREE.EdgesGeometry(this.bufferGeometry, 6);
        let edgesMtl = new THREE.LineBasicMaterial({color: 0x4169E1});
        this.edgesLineObj3d = new THREE.LineSegments(cubeEdges, edgesMtl);
        this.edgesLineObj3d.visible = false;
        this.add(this.edgesLineObj3d);
    }

    stickToPlate() {
        this.computeBoundingBox();
        this.position.y = this.position.y - this.boundingBox.min.y;
    }

    computeBoundingBox() {
        // after operated(move/scale/rotate), model.geometry is not changed
        // so need to call: bufferGemotry.applyMatrix(matrixLocal);
        // then call: bufferGemotry.computeBoundingBox(); to get operated modelMesh BoundingBox
        // clone this.convexBufferGeometry then clone.computeBoundingBox() is faster.
        const clone = this.convexBufferGeometry.clone();
        this.updateMatrix();
        clone.applyMatrix(this.matrix);
        clone.computeBoundingBox();
        this.boundingBox = clone.boundingBox;
    }

    setSelected(value) {
        this.isSelected = value;
        if (this.mode === "prepare") {
            if (this.isSelected) {
                this.edgesLineObj3d.visible = true;
                this.material = materialSelected;
            } else {
                this.edgesLineObj3d.visible = false;
                this.material = materialNormal;
            }
        } else if (this.mode === "preview") {
            this.material = materialTransparent;
        }
    }

    /**
     * 参考Cura
     * prepare模式下：material根据selected切换
     * preview模式下：切换到materialTransparent
     * @param mode: prepare/preview
     * @param isSelected: 是否选中，boolean
     */
    setMode(mode) {
        if (mode) {
            this.mode = mode
            if (this.mode === "prepare") {
                if (this.isSelected) {
                    this.edgesLineObj3d.visible = true;
                    this.material = materialSelected;
                } else {
                    this.edgesLineObj3d.visible = false;
                    this.material = materialNormal;
                }
            } else if (this.mode === "preview") {
                this.edgesLineObj3d.visible = true;
                this.material = materialTransparent;
            }
        }
    }

    // setMatrix(matrix) {
    //     this.updateMatrix();
    //     this.applyMatrix(new THREE.Matrix4().getInverse(this.matrix));
    //     this.applyMatrix(matrix);
    //     // attention: do not use Object3D.applyMatrix(matrix : Matrix4)
    //     // because applyMatrix is accumulated
    //     // anther way: decompose Matrix and reset position/rotation/scale
    //     // let position = new THREE.Vector3();
    //     // let quaternion = new THREE.Quaternion();
    //     // let scale = new THREE.Vector3();
    //     // matrix.decompose(position, quaternion, scale);
    //     // this.position.copy(position);
    //     // this.quaternion.copy(quaternion);
    //     // this.scale.copy(scale);
    // }

    clone() {
        const clone = new Model3D(
            this.bufferGeometry.clone(),
            this.convexBufferGeometry.clone(),
            this.modelName,
            this.modelPath
        );

        //TODO：setMatrix居然不符合预期
        const {x, y, rx, ry, rz, sx, sy, sz} = this.transformation;
        clone.transformation = this.transformation;
        clone.position.x = x;
        clone.position.z = -y; //坐标轴不同

        clone.rotation.x = rx;
        clone.rotation.y = ry;
        clone.rotation.z = rz;

        clone.scale.copy(new THREE.Vector3(sx, sy, sz));
        clone.stickToPlate();
        return clone;
    }

    layFlat() {
        const epsilon = 1e-6;
        const positionX = this.position.x;
        const positionZ = this.position.z;

        // Attention: the minY-vertex and min-angle-vertex must be in the same face
        // transform convexGeometry clone
        this.updateMatrix();
        let convexGeometryClone = this.convexGeometry.clone();
        convexGeometryClone.applyMatrix(this.matrix);
        let faces = convexGeometryClone.faces;
        let vertices = convexGeometryClone.vertices;

        // find out the following params:
        let minY = Number.MAX_VALUE;
        let minYVertexIndex = -1;
        let minAngleVertexIndex = -1; // The angle between the vector(minY-vertex -> min-angle-vertex) and the x-z plane is minimal
        let minAngleFace = null;

        // find minY and minYVertexIndex
        for (let i = 0; i < vertices.length; i++) {
            if (vertices[i].y < minY) {
                minY = vertices[i].y;
                minYVertexIndex = i;
            }
        }

        // get minY vertices count
        let minYVerticesCount = 0;
        for (let i = 0; i < vertices.length; i++) {
            if (vertices[i].y - minY < epsilon) {
                ++minYVerticesCount;
            }
        }

        if (minYVerticesCount >= 3) {
            // already lay flat
            return;
        }

        // find minAngleVertexIndex
        if (minYVerticesCount === 2) {
            for (let i = 0; i < vertices.length; i++) {
                if (vertices[i].y - minY < epsilon && i !== minYVertexIndex) {
                    minAngleVertexIndex = i;
                }
            }
        } else if (minYVerticesCount === 1) {
            let sinValue = Number.MAX_VALUE; // sin value of the angle between directionVector3 and x-z plane
            for (let i = 1; i < vertices.length; i++) {
                if (i !== minYVertexIndex) {
                    const directionVector3 = new THREE.Vector3().subVectors(vertices[i], vertices[minYVertexIndex]);
                    const length = directionVector3.length();
                    // min sinValue corresponds minAngleVertexIndex
                    if (directionVector3.y / length < sinValue) {
                        sinValue = directionVector3.y / length;
                        minAngleVertexIndex = i;
                    }
                }
            }
            // transform model to make min-angle-vertex y equal to minY
            const vb1 = new THREE.Vector3().subVectors(vertices[minAngleVertexIndex], vertices[minYVertexIndex]);
            const va1 = new THREE.Vector3(vb1.x, 0, vb1.z);
            const matrix1 = this._getRotateMatrix(va1, vb1);
            this.applyMatrix(matrix1);
            this.stickToPlate();

            // update geometry
            convexGeometryClone = this.convexGeometry.clone();
            convexGeometryClone.applyMatrix(this.matrix);
            faces = convexGeometryClone.faces;
        }

        // now there must be 2 minY vertices
        // find minAngleFace
        const candidateFaces = [];
        for (let i = 0; i < faces.length; i++) {
            const face = faces[i];
            if ([face.a, face.b, face.c].includes(minYVertexIndex) &&
                [face.a, face.b, face.c].includes(minAngleVertexIndex)) {
                candidateFaces.push(face);
            }
        }

        // max cos value corresponds min angle
        convexGeometryClone.computeFaceNormals();
        let cosValue = Number.MIN_VALUE;
        for (let i = 0; i < candidateFaces.length; i++) {
            // faceNormal points model outer surface
            const faceNormal = candidateFaces[i].normal;
            if (faceNormal.y < 0) {
                const cos = -faceNormal.y / faceNormal.length();
                if (cos > cosValue) {
                    cosValue = cos;
                    minAngleFace = candidateFaces[i];
                }
            }
        }

        const xzPlaneNormal = new THREE.Vector3(0, -1, 0);
        const vb2 = minAngleFace.normal;
        const matrix2 = this._getRotateMatrix(xzPlaneNormal, vb2);
        this.applyMatrix(matrix2);
        this.stickToPlate();
        this.position.x = positionX;
        this.position.z = positionZ;
    }

    // get matrix for rotating v2 to v1. Applying matrix to v2 can make v2 to parallels v1.
    _getRotateMatrix(v1, v2) {
        // https://stackoverflow.com/questions/1171849/finding-quaternion-representing-the-rotation-from-one-vector-to-another
        const cross = new THREE.Vector3();
        cross.crossVectors(v2, v1);
        const dot = v1.dot(v2);

        const l1 = v1.length();
        const l2 = v2.length();
        const w = l1 * l2 + dot;
        const x = cross.x;
        const y = cross.y;
        const z = cross.z;

        const q = new THREE.Quaternion(x, y, z, w);
        q.normalize();

        const matrix4 = new THREE.Matrix4();
        matrix4.makeRotationFromQuaternion(q);
        return matrix4;
    }

    // 优化 3D打印功能 模型调整操作区
    updateTransformation(key, value, uniformScaleFlag) {
        console.log(`更新 ${key} ${value}`)
        if (isNaN(value) && key !== 'isUniformScaling') value = 0

        //TODO：增加判断
        this.transformation[key] = value;

        let {x, y, z, rx, ry, rz, scale, sx, sy, sz, scaleWidth, scaleHeight, scaleDepth, ogScaleWidth, ogScaleHeight, ogScaleDepth, isUniformScaling} = this.transformation;
        console.log(`锁定比例 ${isUniformScaling}`)
        
        this.position.x = x;
        this.position.y = z;
        // this.position.z = z;
        this.position.z = -y; //坐标轴不同

        this.rotation.x = rx;
        this.rotation.y = ry;
        this.rotation.z = rz;

        if (key === 'scaleWidth') {
            sx = Number.parseFloat(scaleWidth / ogScaleWidth)
            this.updateTransformation('sx', sx)
            return
        }

        if (key === 'scaleHeight') {
            sy = Number.parseFloat(scaleHeight / ogScaleHeight)
            this.updateTransformation('sy', sy)
            return
        }

        if (key === 'scaleDepth') {
            sz = Number.parseFloat(scaleDepth / ogScaleDepth)
            this.updateTransformation('sz', sz)
            return
        }

        if (key === 'sx') {
            scaleWidth = Number(Number.parseFloat(sx * ogScaleWidth).toFixed(2))
            this.transformation.scaleWidth = scaleWidth
            this.scale.copy(new THREE.Vector3(this.transformation.sx, this.transformation.sy, this.transformation.sz));
            
            if (!uniformScaleFlag && isUniformScaling) {
                this.updateTransformation('sy', this.transformation.sx, true)
                this.updateTransformation('sz', this.transformation.sx, true)
            }
        }

        if (key === 'sy') {
            scaleHeight = Number(Number.parseFloat(sy * ogScaleHeight).toFixed(2))
            this.transformation.scaleHeight = scaleHeight
            this.scale.copy(new THREE.Vector3(this.transformation.sx, this.transformation.sy, this.transformation.sz));

            if (!uniformScaleFlag && isUniformScaling) {
                this.updateTransformation('sx', this.transformation.sy, true)
                this.updateTransformation('sz', this.transformation.sy, true)
            }
        }

        if (key === 'sz') {
            scaleDepth = Number(Number.parseFloat(sz * ogScaleDepth).toFixed(2))
            this.transformation.scaleDepth = scaleDepth
            this.scale.copy(new THREE.Vector3(this.transformation.sx, this.transformation.sy, this.transformation.sz));

            if (!uniformScaleFlag && isUniformScaling) {
                this.updateTransformation('sy', this.transformation.sz, true)
                this.updateTransformation('sx', this.transformation.sz, true)
            }
        }

        // console.log(this.scale)
        console.log(this.transformation.sx, this.transformation.sy, this.transformation.sz)
    }
}

export default Model3D;
