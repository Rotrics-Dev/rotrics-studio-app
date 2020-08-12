import colornames from 'colornames';
import * as THREE from 'three';

const OFFSET_ARM = 12.5;
const SAFE_BOUNDARY = 3;

const FRONT_END = {
    LASER: 'LASER',
    PUMP: 'PUMP',
    PEN: 'PEN',
    P3D: 'P3D',
    CAMERA: 'CAMERA'
}
const OFFSET = {
    LASER: 88.217 + OFFSET_ARM,
    PUMP: 105 + OFFSET_ARM,
    PEN: 101.5 + OFFSET_ARM,
    P3D: 92.6 + OFFSET_ARM,
    CAMERA: 107.7 + OFFSET_ARM
}

class WorkArea {
    group = new THREE.Object3D();

    constructor(frontEnd = FRONT_END.PEN) {
        this.frontEndOffset = OFFSET[frontEnd];
        const red = colornames('red');
        const green = colornames('green');

        const curve1 = new THREE.EllipseCurve(
            0, 0,// ax, aY
            70.9 + this.frontEndOffset, 70.9 + this.frontEndOffset,// xRadius, yRadius
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
            300 + this.frontEndOffset, 300 + this.frontEndOffset,// xRadius, yRadius
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