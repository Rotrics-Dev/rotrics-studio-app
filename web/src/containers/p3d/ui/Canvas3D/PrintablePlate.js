import * as THREE from 'three';
import _ from 'lodash';
import colornames from 'colornames';
import GridLine from './GridLine';
import CoordinateAxes from './CoordinateAxes';
import TextSprite from '../../../../three-extensions/TextSprite';
import TargetPoint from '../../../../three-extensions/TargetPoint';

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


        {//addLatheGeometry

            const points = [];
            {
                points.push(new THREE.Vector2(229.8, -127.0));
                points.push(new THREE.Vector2(232.9, -125.0));
                points.push(new THREE.Vector2(235.9, -123.0));
                points.push(new THREE.Vector2(238.7, -121.0));
                points.push(new THREE.Vector2(241.3, -119.0));
                points.push(new THREE.Vector2(243.9, -117.0));
                points.push(new THREE.Vector2(246.3, -115.0));
                points.push(new THREE.Vector2(248.6, -113.0));
                points.push(new THREE.Vector2(250.9, -111.0));
                points.push(new THREE.Vector2(253.0, -109.0));
                points.push(new THREE.Vector2(255.1, -107.0));
                points.push(new THREE.Vector2(257.1, -105.0));
                points.push(new THREE.Vector2(259.0, -103.0));
                points.push(new THREE.Vector2(260.9, -101.0));
                points.push(new THREE.Vector2(262.7, -99.0));
                points.push(new THREE.Vector2(264.4, -97.0));
                points.push(new THREE.Vector2(266.1, -95.0));
                points.push(new THREE.Vector2(267.7, -93.0));
                points.push(new THREE.Vector2(269.2, -91.0));
                points.push(new THREE.Vector2(270.7, -89.0));
                points.push(new THREE.Vector2(272.2, -87.0));
                points.push(new THREE.Vector2(273.6, -85.0));
                points.push(new THREE.Vector2(274.9, -83.0));
                points.push(new THREE.Vector2(276.2, -81.0));
                points.push(new THREE.Vector2(277.5, -79.0));
                points.push(new THREE.Vector2(278.7, -77.0));
                points.push(new THREE.Vector2(279.9, -75.0));
                points.push(new THREE.Vector2(281.0, -73.0));
                points.push(new THREE.Vector2(282.1, -71.0));
                points.push(new THREE.Vector2(283.2, -69.0));
                points.push(new THREE.Vector2(284.2, -67.0));
                points.push(new THREE.Vector2(285.2, -65.0));
                points.push(new THREE.Vector2(286.1, -63.0));
                points.push(new THREE.Vector2(287.0, -61.0));
                points.push(new THREE.Vector2(287.9, -59.0));
                points.push(new THREE.Vector2(288.7, -57.0));
                points.push(new THREE.Vector2(289.6, -55.0));
                points.push(new THREE.Vector2(290.3, -53.0));
                points.push(new THREE.Vector2(291.1, -51.0));
                points.push(new THREE.Vector2(291.8, -49.0));
                points.push(new THREE.Vector2(292.4, -47.0));
                points.push(new THREE.Vector2(293.1, -45.0));
                points.push(new THREE.Vector2(293.7, -43.0));
                points.push(new THREE.Vector2(294.3, -41.0));
                points.push(new THREE.Vector2(294.8, -39.0));
                points.push(new THREE.Vector2(295.4, -37.0));
                points.push(new THREE.Vector2(295.9, -35.0));
                points.push(new THREE.Vector2(296.3, -33.0));
                points.push(new THREE.Vector2(296.8, -31.0));
                points.push(new THREE.Vector2(297.2, -29.0));
                points.push(new THREE.Vector2(297.5, -27.0));
                points.push(new THREE.Vector2(297.9, -25.0));
                points.push(new THREE.Vector2(298.2, -23.0));
                points.push(new THREE.Vector2(298.5, -21.0));
                points.push(new THREE.Vector2(298.8, -19.0));
                points.push(new THREE.Vector2(299.0, -17.0));
                points.push(new THREE.Vector2(299.2, -15.0));
                points.push(new THREE.Vector2(299.4, -13.0));
                points.push(new THREE.Vector2(299.6, -11.0));
                points.push(new THREE.Vector2(299.7, -9.0));
                points.push(new THREE.Vector2(299.8, -7.0));
                points.push(new THREE.Vector2(299.9, -5.0));
                points.push(new THREE.Vector2(300.0, -3.0));
                points.push(new THREE.Vector2(300.0, -1.0));
                points.push(new THREE.Vector2(300.0, 1.0));
                points.push(new THREE.Vector2(300.0, 3.0));
                points.push(new THREE.Vector2(299.9, 5.0));
                points.push(new THREE.Vector2(299.8, 7.0));
                points.push(new THREE.Vector2(299.7, 9.0));
                points.push(new THREE.Vector2(299.6, 11.0));
                points.push(new THREE.Vector2(299.4, 13.0));
                points.push(new THREE.Vector2(299.2, 15.0));
                points.push(new THREE.Vector2(299.0, 17.0));
                points.push(new THREE.Vector2(298.8, 19.0));
                points.push(new THREE.Vector2(298.5, 21.0));
                points.push(new THREE.Vector2(298.2, 23.0));
                points.push(new THREE.Vector2(298.1, 25.0));
                points.push(new THREE.Vector2(298.1, 27.0));
                points.push(new THREE.Vector2(298.0, 29.0));
                points.push(new THREE.Vector2(298.0, 31.0));
                points.push(new THREE.Vector2(297.8, 33.0));
                points.push(new THREE.Vector2(297.7, 35.0));
                points.push(new THREE.Vector2(297.5, 37.0));
                points.push(new THREE.Vector2(297.3, 39.0));
                points.push(new THREE.Vector2(297.1, 41.0));
                points.push(new THREE.Vector2(296.9, 43.0));
                points.push(new THREE.Vector2(296.6, 45.0));
                points.push(new THREE.Vector2(296.3, 47.0));
                points.push(new THREE.Vector2(296.0, 49.0));
                points.push(new THREE.Vector2(295.6, 51.0));
                points.push(new THREE.Vector2(295.2, 53.0));
                points.push(new THREE.Vector2(294.8, 55.0));
                points.push(new THREE.Vector2(294.3, 57.0));
                points.push(new THREE.Vector2(293.9, 59.0));
                points.push(new THREE.Vector2(293.4, 61.0));
                points.push(new THREE.Vector2(292.8, 63.0));
                points.push(new THREE.Vector2(292.3, 65.0));
                points.push(new THREE.Vector2(291.7, 67.0));
                points.push(new THREE.Vector2(291.1, 69.0));
                points.push(new THREE.Vector2(290.4, 71.0));
                points.push(new THREE.Vector2(289.7, 73.0));
                points.push(new THREE.Vector2(289.0, 75.0));
                points.push(new THREE.Vector2(288.3, 77.0));
                points.push(new THREE.Vector2(287.5, 79.0));
                points.push(new THREE.Vector2(286.7, 81.0));
                points.push(new THREE.Vector2(285.8, 83.0));
                points.push(new THREE.Vector2(284.9, 85.0));
                points.push(new THREE.Vector2(284.0, 87.0));
                points.push(new THREE.Vector2(283.1, 89.0));
                points.push(new THREE.Vector2(282.1, 91.0));
                points.push(new THREE.Vector2(281.1, 93.0));
                points.push(new THREE.Vector2(280.0, 95.0));
                points.push(new THREE.Vector2(278.9, 97.0));
                points.push(new THREE.Vector2(277.7, 99.0));
                points.push(new THREE.Vector2(276.6, 101.0));
                points.push(new THREE.Vector2(275.3, 103.0));
                points.push(new THREE.Vector2(274.1, 105.0));
                points.push(new THREE.Vector2(272.7, 107.0));
                points.push(new THREE.Vector2(271.4, 109.0));
                points.push(new THREE.Vector2(270.0, 111.0));
                points.push(new THREE.Vector2(268.5, 113.0));
                points.push(new THREE.Vector2(267.0, 115.0));
                points.push(new THREE.Vector2(265.4, 117.0));
                points.push(new THREE.Vector2(263.8, 119.0));
                points.push(new THREE.Vector2(262.1, 121.0));
                points.push(new THREE.Vector2(260.4, 123.0));
                points.push(new THREE.Vector2(258.6, 125.0));
                points.push(new THREE.Vector2(256.7, 127.0));
                points.push(new THREE.Vector2(254.8, 129.0));
                points.push(new THREE.Vector2(252.7, 131.0));
                points.push(new THREE.Vector2(250.6, 133.0));
                points.push(new THREE.Vector2(248.5, 135.0));
                points.push(new THREE.Vector2(246.2, 137.0));
                points.push(new THREE.Vector2(243.8, 139.0));
                points.push(new THREE.Vector2(241.4, 141.0));
                points.push(new THREE.Vector2(238.8, 143.0));
                points.push(new THREE.Vector2(236.1, 145.0));
                points.push(new THREE.Vector2(233.3, 147.0));
                points.push(new THREE.Vector2(230.3, 149.0));
                points.push(new THREE.Vector2(227.1, 151.0));
                points.push(new THREE.Vector2(223.8, 153.0));
                points.push(new THREE.Vector2(220.3, 155.0));
                points.push(new THREE.Vector2(216.5, 157.0));
                points.push(new THREE.Vector2(212.5, 159.0));
                points.push(new THREE.Vector2(208.1, 161.0));
                points.push(new THREE.Vector2(203.2, 163.0));
                points.push(new THREE.Vector2(197.9, 165.0));
                points.push(new THREE.Vector2(191.8, 167.0));
                points.push(new THREE.Vector2(191.8, 167.0));
                points.push(new THREE.Vector2(106.2, 167));
                points.push(new THREE.Vector2(106.2, 167));
                points.push(new THREE.Vector2(106.5, 165));
                points.push(new THREE.Vector2(106.8, 163));
                points.push(new THREE.Vector2(107.1, 161));
                points.push(new THREE.Vector2(107.3, 159));
                points.push(new THREE.Vector2(107.5, 157));
                points.push(new THREE.Vector2(107.6, 155));
                points.push(new THREE.Vector2(107.8, 153));
                points.push(new THREE.Vector2(107.9, 151));
                points.push(new THREE.Vector2(107.9, 149));
                points.push(new THREE.Vector2(108, 147));
                points.push(new THREE.Vector2(108, 145));
                points.push(new THREE.Vector2(108, 143));
                points.push(new THREE.Vector2(108, 141));
                points.push(new THREE.Vector2(107.9, 139));
                points.push(new THREE.Vector2(107.9, 137));
                points.push(new THREE.Vector2(107.8, 135));
                points.push(new THREE.Vector2(107.6, 133));
                points.push(new THREE.Vector2(107.5, 131));
                points.push(new THREE.Vector2(107.3, 129));
                points.push(new THREE.Vector2(107.1, 127));
                points.push(new THREE.Vector2(106.8, 125));
                points.push(new THREE.Vector2(106.6, 123));
                points.push(new THREE.Vector2(106.3, 121));
                points.push(new THREE.Vector2(105.9, 119));
                points.push(new THREE.Vector2(105.6, 117));
                points.push(new THREE.Vector2(105.2, 115));
                points.push(new THREE.Vector2(104.8, 113));
                points.push(new THREE.Vector2(104.4, 111));
                points.push(new THREE.Vector2(103.9, 109));
                points.push(new THREE.Vector2(103.4, 107));
                points.push(new THREE.Vector2(102.9, 105));
                points.push(new THREE.Vector2(102.3, 103));
                points.push(new THREE.Vector2(101.8, 101));
                points.push(new THREE.Vector2(101.1, 99));
                points.push(new THREE.Vector2(100.5, 97));
                points.push(new THREE.Vector2(99.8, 95));
                points.push(new THREE.Vector2(99.1, 93));
                points.push(new THREE.Vector2(98.4, 91));
                points.push(new THREE.Vector2(97.6, 89));
                points.push(new THREE.Vector2(96.8, 87));
                points.push(new THREE.Vector2(96, 85));
                points.push(new THREE.Vector2(95.1, 83));
                points.push(new THREE.Vector2(94.2, 81));
                points.push(new THREE.Vector2(93.2, 79));
                points.push(new THREE.Vector2(92.3, 77));
                points.push(new THREE.Vector2(91.3, 75));
                points.push(new THREE.Vector2(90.2, 73));
                points.push(new THREE.Vector2(89.1, 71));
                points.push(new THREE.Vector2(88, 69));
                points.push(new THREE.Vector2(86.8, 67));
                points.push(new THREE.Vector2(85.6, 65));
                points.push(new THREE.Vector2(84.3, 63));
                points.push(new THREE.Vector2(83, 61));
                points.push(new THREE.Vector2(81.7, 59));
                points.push(new THREE.Vector2(80.3, 57));
                points.push(new THREE.Vector2(78.8, 55));
                points.push(new THREE.Vector2(77.3, 53));
                points.push(new THREE.Vector2(75.8, 51));
                points.push(new THREE.Vector2(74.2, 49));
                points.push(new THREE.Vector2(72.5, 47));
                points.push(new THREE.Vector2(70.9, 45));
                points.push(new THREE.Vector2(70.9, 43));
                points.push(new THREE.Vector2(70.9, 41));
                points.push(new THREE.Vector2(70.9, 39));
                points.push(new THREE.Vector2(70.9, 37));
                points.push(new THREE.Vector2(70.9, 35));
                points.push(new THREE.Vector2(70.9, 33));
                points.push(new THREE.Vector2(70.9, 31));
                points.push(new THREE.Vector2(70.9, 29));
                points.push(new THREE.Vector2(70.9, 27));
                points.push(new THREE.Vector2(70.9, 25));
                points.push(new THREE.Vector2(70.9, 23));
                points.push(new THREE.Vector2(70.9, 21));
                points.push(new THREE.Vector2(70.9, 19));
                points.push(new THREE.Vector2(70.9, 17));
                points.push(new THREE.Vector2(70.9, 15));
                points.push(new THREE.Vector2(70.9, 13));
                points.push(new THREE.Vector2(70.9, 11));
                points.push(new THREE.Vector2(70.9, 9));
                points.push(new THREE.Vector2(70.9, 7));
                points.push(new THREE.Vector2(70.9, 5));
                points.push(new THREE.Vector2(70.9, 3));
                points.push(new THREE.Vector2(70.9, 1));
                points.push(new THREE.Vector2(70.9, -1));
                points.push(new THREE.Vector2(70.9, -3));
                points.push(new THREE.Vector2(70.9, -5));
                points.push(new THREE.Vector2(70.9, -7));
                points.push(new THREE.Vector2(70.9, -9));
                points.push(new THREE.Vector2(70.9, -11));
                points.push(new THREE.Vector2(70.9, -13));
                points.push(new THREE.Vector2(70.9, -15));
                points.push(new THREE.Vector2(70.9, -17));
                points.push(new THREE.Vector2(70.9, -19));
                points.push(new THREE.Vector2(70.9, -21));
                points.push(new THREE.Vector2(70.9, -23));
                points.push(new THREE.Vector2(70.9, -25));
                points.push(new THREE.Vector2(70.9, -27));
                points.push(new THREE.Vector2(70.9, -29));
                points.push(new THREE.Vector2(70.9, -31));
                points.push(new THREE.Vector2(73.3, -33));
                points.push(new THREE.Vector2(75.7, -35));
                points.push(new THREE.Vector2(77.9, -37));
                points.push(new THREE.Vector2(80.1, -39));
                points.push(new THREE.Vector2(82.2, -41));
                points.push(new THREE.Vector2(84.2, -43));
                points.push(new THREE.Vector2(86.1, -45));
                points.push(new THREE.Vector2(88, -47));
                points.push(new THREE.Vector2(89.8, -49));
                points.push(new THREE.Vector2(91.5, -51));
                points.push(new THREE.Vector2(93.2, -53));
                points.push(new THREE.Vector2(94.8, -55));
                points.push(new THREE.Vector2(96.4, -57));
                points.push(new THREE.Vector2(97.9, -59));
                points.push(new THREE.Vector2(99.4, -61));
                points.push(new THREE.Vector2(100.8, -63));
                points.push(new THREE.Vector2(102.1, -65));
                points.push(new THREE.Vector2(103.4, -67));
                points.push(new THREE.Vector2(104.7, -69));
                points.push(new THREE.Vector2(105.9, -71));
                points.push(new THREE.Vector2(107.1, -73));
                points.push(new THREE.Vector2(108.2, -75));
                points.push(new THREE.Vector2(109.3, -77));
                points.push(new THREE.Vector2(110.4, -79));
                points.push(new THREE.Vector2(111.4, -81));
                points.push(new THREE.Vector2(112.4, -83));
                points.push(new THREE.Vector2(113.4, -85));
                points.push(new THREE.Vector2(114.3, -87));
                points.push(new THREE.Vector2(115.1, -89));
                points.push(new THREE.Vector2(116, -91));
                points.push(new THREE.Vector2(116.8, -93));
                points.push(new THREE.Vector2(117.6, -95));
                points.push(new THREE.Vector2(118.3, -97));
                points.push(new THREE.Vector2(119, -99));
                points.push(new THREE.Vector2(119.7, -101));
                points.push(new THREE.Vector2(120.4, -103));
                points.push(new THREE.Vector2(121, -105));
                points.push(new THREE.Vector2(121.6, -107));
                points.push(new THREE.Vector2(122.1, -109));
                points.push(new THREE.Vector2(122.7, -111));
                points.push(new THREE.Vector2(123.2, -113));
                points.push(new THREE.Vector2(123.6, -115));
                points.push(new THREE.Vector2(124.1, -117));
                points.push(new THREE.Vector2(124.5, -119));
                points.push(new THREE.Vector2(124.9, -121));
                points.push(new THREE.Vector2(125.2, -123));
                points.push(new THREE.Vector2(125.5, -125));
                points.push(new THREE.Vector2(125.8, -127));
            }
            var latheGeometry = new THREE.LatheGeometry(points, 50, Math.PI / 2, Math.PI*2);
            const latheMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
            const lathe = new THREE.Mesh(latheGeometry, latheMaterial);
            this.add(lathe);

            // const torusGeometry = new THREE.TorusGeometry(10, 3, 16, 100);
            // // const torusMaterial = new THREE.MeshBasicMaterial({color: 0xFFFF00});
            // const torusMaterial = new THREE.LineBasicMaterial({
            //     linewidth: 1,
            //     color: 0xFFFF00,
            //     opacity: 0.8,
            //     transparent: true
            // })
            // const torus = new THREE.Mesh(torusGeometry, torusMaterial);
            // this.add(torus);

            // for (var i = 0; i < 10; i++) {
            //     points.push(new THREE.Vector2(Math.sin(i * 0.2) * 10 + 5, (i - 5) * 2));
            // }
            // var geometry = new THREE.LatheGeometry(points, 50, Math.PI / 2, Math.PI);
            // var material = new THREE.MeshBasicMaterial({color: 0xffff00});
            // var lathe = new THREE.Mesh(geometry, material);
            // this.add(lathe);

        }
        {//test LocalStorage
            console.log(localStorage.getItem("喵"));
            localStorage.setItem("喵", "呀呀呀呀");
            console.log(localStorage.getItem("喵"));
        }
    }

    changeCoordinateVisibility(value) {
        // this.coordinateVisible = value;
        this.coordinateSystem && (this.coordinateSystem.visible = value);
    }
}

export default PrintablePlate;
