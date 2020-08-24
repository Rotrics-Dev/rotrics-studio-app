import * as THREE from 'three';
import _ from 'lodash';
import colornames from 'colornames';
import GridLine from './GridLine';
import CoordinateAxes from './CoordinateAxes';
import TextSprite from '../../../../three-extensions/TextSprite';
import TargetPoint from '../../../../three-extensions/TargetPoint';
import {getLathePoints} from './../../../../utils/workAreaUtils.js'

const METRIC_GRID_SPACING = 10; // 10 mm

class PrintablePlate extends THREE.Object3D {
    constructor(size) {
        super();
        this.isPrintPlane = true;
        this.type = 'PrintPlane';
        this.targetPoint = null;
        // this.coordinateVisible = true;
        this.coordinateSystem = null;
        this.size = size;
        this._setup();
    }

    updateSize(size) {
        this.size = size;
        this.remove(...this.children);
        this._setup();
    }

    _setup() {
        { // Metric
            const gridSpacing = METRIC_GRID_SPACING;
            const axisXLength = Math.ceil(this.size.x / gridSpacing) * gridSpacing;
            const axisYLength = Math.ceil(this.size.y / gridSpacing) * gridSpacing;

            const group = new THREE.Group();

            { // Coordinate Grid
                const gridLine = new GridLine(
                    axisXLength,
                    gridSpacing,
                    axisYLength,
                    gridSpacing,
                    colornames('blue'), // center line
                    colornames('gray 44') // grid
                );
                _.each(gridLine.children, (o) => {
                    o.material.opacity = 0.15;
                    o.material.transparent = true;
                    o.material.depthWrite = false;
                });
                gridLine.name = 'GridLine';
                group.add(gridLine);
            }

            { // Coordinate Axes
                const coordinateAxes = new CoordinateAxes(axisXLength, axisYLength);
                coordinateAxes.name = 'CoordinateAxes';
                group.add(coordinateAxes);
            }

            { // Axis Labels
                const axisXLabel = new TextSprite({
                    x: axisXLength + 10,
                    y: 0,
                    z: 0,
                    size: 10,
                    text: 'X',
                    color: colornames('red')
                });
                const axisYLabel = new TextSprite({
                    x: 0,
                    y: axisYLength + 10,
                    z: 0,
                    size: 10,
                    text: 'Y',
                    color: colornames('green')
                });

                group.add(axisXLabel);
                group.add(axisYLabel);

                const textSize = (10 / 3);
                for (let x = -axisXLength; x <= axisXLength; x += gridSpacing) {
                    if (x !== 0) {
                        const textLabel = new TextSprite({
                            x: x,
                            y: -4,
                            z: 0,
                            size: textSize,
                            text: x,
                            textAlign: 'center',
                            textBaseline: 'bottom',
                            color: colornames('red'),
                            opacity: 0.5
                        });
                        group.add(textLabel);
                    }
                }
                for (let y = -axisYLength; y <= axisYLength; y += gridSpacing) {
                    if (y !== 0) {
                        const textLabel = new TextSprite({
                            x: -4,
                            y: y,
                            z: 0,
                            size: textSize,
                            text: y,
                            textAlign: 'center',
                            textBaseline: 'bottom',
                            color: colornames('green'),
                            opacity: 0.5
                        });
                        group.add(textLabel);
                    }
                }
            }
            this.coordinateSystem = group;
            group.name = 'MetricCoordinateSystem';
            this.add(group);
        }

        { // Target Point
            this.targetPoint = new TargetPoint({
                color: colornames('indianred'),
                radius: 0.5
            });
            this.targetPoint.name = 'TargetPoint';
            this.targetPoint.visible = true;
            this.add(this.targetPoint);
        }


        {//add work area

            const points = getLathePoints();

            var geometry = new THREE.LatheGeometry(points, 25, Math.PI / 2, Math.PI);
            const slice1 = new THREE.Shape();
            const slice2 = new THREE.Shape();
            slice1.moveTo(points[0].x, points[0].y);
            slice2.moveTo(-points[0].x, points[0].y);
            for (let index = 1; index < points.length; index++) {
                slice1.lineTo(points[index].x, points[index].y)
                slice2.lineTo(-points[index].x, points[index].y)
            }
            const rightGeometry = new THREE.ShapeGeometry(slice1);
            const leftGeometry = new THREE.ShapeGeometry(slice2);
            geometry.merge(leftGeometry)
            geometry.merge(rightGeometry);


            {//
                const material = new THREE.MeshPhongMaterial({
                    color: 0x998877,
                    specular: 0xb0b0b0,
                    shininess: 1000,
                    transparent: true,
                    opacity: 0.3,
                    depthTest: false
                });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.rotateX(-Math.PI / 2);
                mesh.translateY(127);
                this.add(mesh);
            }

            {//点线
                // const line = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
                //     color: 0xb0b0b0,
                //     shininess: 30,
                //     transparent: true,
                //     opacity: 0.3,
                //     depthTest: false
                // }));
                // line.rotateX(-Math.PI / 2);
                // this.add(line);
            }
            {//网格
                // const wireframe = new THREE.WireframeGeometry(geometry);
                // const line = new THREE.LineSegments(wireframe, new THREE.LineBasicMaterial({
                //     color: 0xb0b0b0,
                //     shininess: 30,
                //     transparent: true,
                //     opacity: 0.2,
                //     depthTest: false
                // }));
                // line.rotateX(-Math.PI / 2);
                // this.add(line);
            }
        }
    }

    changeCoordinateVisibility(value) {
        // this.coordinateVisible = value;
        this.coordinateSystem && (this.coordinateSystem.visible = value);
    }
}

export default PrintablePlate;
