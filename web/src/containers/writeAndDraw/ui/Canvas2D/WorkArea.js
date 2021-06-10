import colornames from 'colornames';
import * as THREE from 'three';
import {getLimit, FRONT_END} from './../../../../utils/workAreaUtils.js'
// const OFFSET_ARM = 12.5;
// const SAFE_BOUNDARY = 3;
//
// const FRONT_END = {
//     LASER: 'LASER',
//     PUMP: 'PUMP',
//     PEN: 'PEN',
//     P3D: 'P3D',
//     CAMERA: 'CAMERA'
// }
// const OFFSET = {
//     LASER: 88.217 + OFFSET_ARM,
//     PUMP: 105 + OFFSET_ARM,
//     PEN: 101.5 + OFFSET_ARM,
//     P3D: 92.6 + OFFSET_ARM,
//     CAMERA: 107.7 + OFFSET_ARM
// }

class WorkArea {
    group = new THREE.Object3D();

    constructor(z) {
        const red = colornames('red');
        const green = colornames('blue');
        let limit = getLimit(z, FRONT_END.PEN);

        const curve1 = new THREE.EllipseCurve(
            0, 0,// ax, aY
            limit.innerRadius, limit.innerRadius,// xRadius, yRadius
            0, Math.PI,// aStartAngle, aEndAngle
            false,// aClockwise
            0// aRotation
        )
        const points1 = curve1.getPoints(50);
        const geometry1 = new THREE.BufferGeometry().setFromPoints(points1);
        const material1 = new THREE.LineBasicMaterial({color: red});
        const ellipse1 = new THREE.Line(geometry1, material1);
        this.group.add(ellipse1);

        const curve2 = new THREE.EllipseCurve(
            0, 0,// ax, aY
            limit.outerRadius, limit.outerRadius,// xRadius, yRadius
            0, Math.PI,// aStartAngle, aEndAngle
            false,// aClockwise
            0// aRotation
        )
        const points2 = curve2.getPoints(50);
        const geometry2 = new THREE.BufferGeometry().setFromPoints(points2);
        const material2 = new THREE.LineBasicMaterial({color: red});
        const ellipse2 = new THREE.Line(geometry2, material2);
        this.group.add(ellipse2);

        return this.group;
    }

}

export default WorkArea;