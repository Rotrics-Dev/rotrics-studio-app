import * as THREE from 'three';
import _ from 'lodash';
import colornames from 'colornames';
import GridLine from './GridLine';
import CoordinateAxes from './CoordinateAxes';
import TextSprite from '../../../../three-extensions/TextSprite';
import TargetPoint from '../../../../three-extensions/TargetPoint';
import {FRONT_END, getLimit} from "../../../../utils/workAreaUtils";

const METRIC_GRID_SPACING = 10; // 10 mm

class PrintablePlate extends THREE.Object3D {
    constructor(size, workHeight, frontEnd) {
        super();
        this.isPrintPlane = true;
        this.type = 'PrintPlane';
        this.targetPoint = null;
        // this.coordinateVisible = true;
        this.coordinateSystem = null;
        this.size = size;
        this.workHeight = workHeight;
        this.frontEnd = frontEnd;
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
                    y: 200,
                    z: 0,
                    size: 10,
                    text: 'X',
                    color: colornames('red')
                });
                const axisYLabel = new TextSprite({
                    x: 0,
                    y: axisYLength + 10 + 200,
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
                            y: -4 + 200,
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
                            y: y + 200,
                            z: 0,
                            size: textSize,
                            text: y + 200,
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

            this.setUpWorkArea(this.workHeight)
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
    }

    changeCoordinateVisibility(value) {
        // this.coordinateVisible = value;
        this.coordinateSystem && (this.coordinateSystem.visible = value);
    }

    setUpWorkArea(workHeight) {
        this.workHeight = workHeight;
        let workArea = this.coordinateSystem.getObjectByName('workArea')
        if (workArea) {
            this.coordinateSystem.remove(workArea);
            workArea.geometry.dispose();
            workArea.material.dispose();
        }
        const green = colornames('green');
        let limit = getLimit(this.workHeight, this.frontEnd);
        if (!limit) {
            return;
        }
        const path = new THREE.Path();
        path.moveTo(-limit.outerRadius, 0)
            .arc(limit.outerRadius, 0, limit.outerRadius, -Math.PI, 0, true)
            .lineTo(limit.innerRadius, 0)
            .arc(-limit.innerRadius, 0, limit.innerRadius, 0, -Math.PI, false)
            .closePath();
        workArea = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(path.getPoints(100)),
            new THREE.LineBasicMaterial({color: green})
        )
        workArea.name = 'workArea';
        this.coordinateSystem.add(workArea);
    }
}

export default PrintablePlate;
