import events from "events";
import socketClientManager from "../../../socket/socketClientManager";
import {P3D_SLICE_START, P3D_SLICE_STATUS} from "../../../constants";
import {getUuid} from '../../../utils/index.js';
import GcodeToBufferGeometryWorker from './GcodeToBufferGeometry.worker';
import gcodeBufferGeometryToObj3d from './GcodeToBufferGeometry/gcodeBufferGeometryToObj3d';
import * as THREE from 'three';

const gcodeRenderingWorker = new GcodeToBufferGeometryWorker();

class P3DGcodeManager extends events.EventEmitter {
    constructor() {
        super();
        this.rendererParent = null; //gcode渲染后，作为其child；类型是：Three.Object3D
        this.gcodeObj3d = null; //gcode渲染后的Three.Object3D对象
    }

    //设置gcode渲染结果要展示在哪个object3d上
    setRendererParent(object3d) {
        this.rendererParent = object3d;
    }

    startSlice(stlUrl, materialName, settingName, onSuccess, onProgress, onError) {
        const id = getUuid();
        socketClientManager.removeAllListeners(P3D_SLICE_STATUS);
        socketClientManager.addListener(P3D_SLICE_STATUS, (data) => {
            if (data.id !== id) {
                return;
            }
            const {progress, error, result} = data;
            if (error) {
                onError(error)
            } else if (progress) {
                onProgress(progress);
            } else if (result) {
                onSuccess(result);
            }
        });
        socketClientManager.emitToServer(P3D_SLICE_START, {stlUrl, materialName, settingName, id})
    }

    //渲染gcode并添加到this.rendererParent
    rendererGcode(gcodeUrl, onSuccess, onProgress, onError) {
        this.destroyCurrentGcodeObj3d();
        gcodeRenderingWorker.postMessage({fileUrl: gcodeUrl});
        gcodeRenderingWorker.onmessage = (e) => {
            const data = e.data;
            const {status, value} = data;
            switch (status) {
                case 'succeed': {
                    const {positions, colors, layerIndices, typeCodes, layerCount, bounds} = value;
                    const bufferGeometry = new THREE.BufferGeometry();
                    const positionAttribute = new THREE.Float32BufferAttribute(positions, 3);
                    const colorAttribute = new THREE.Uint8BufferAttribute(colors, 3);
                    // this will map the buffer values to 0.0f - +1.0f in the shader
                    colorAttribute.normalized = true;
                    const layerIndexAttribute = new THREE.Float32BufferAttribute(layerIndices, 1);
                    const typeCodeAttribute = new THREE.Float32BufferAttribute(typeCodes, 1);

                    //a_layer_index: 某个position对应的layer index
                    //a_type_code: 某个position对应的type code
                    bufferGeometry.addAttribute('position', positionAttribute);
                    bufferGeometry.addAttribute('a_color', colorAttribute);
                    bufferGeometry.addAttribute('a_layer_index', layerIndexAttribute);
                    bufferGeometry.addAttribute('a_type_code', typeCodeAttribute);

                    const gcodeObj3d = gcodeBufferGeometryToObj3d(bufferGeometry);

                    const layerCountVisible = layerCount;
                    gcodeObj3d.material.uniforms.u_visible_layer_count.value = layerCountVisible;
                    this.addGcodeObj3d(gcodeObj3d);

                    const data = {
                        layerCount,
                        layerCountVisible,
                        bounds,
                        //rgb保持和ObjToBufferGeometry中TYPE_SETTINGS一致
                        lineTypeVisibility: {
                            'WALL-INNER': {
                                rgb: [0, 255, 0],
                                visible: true
                            },
                            'WALL-OUTER': {
                                rgb: [255, 33, 33],
                                visible: true
                            },
                            'SKIN': {
                                rgb: [255, 255, 0],
                                visible: true
                            },
                            'SKIRT': {
                                rgb: [250, 140, 53],
                                visible: true
                            },
                            'SUPPORT': {
                                rgb: [75, 0, 130],
                                visible: true
                            },
                            'FILL': {
                                rgb: [141, 75, 187],
                                visible: true
                            },
                            'TRAVEL': {
                                rgb: [68, 206, 246],
                                visible: false
                            },
                            'UNKNOWN': {
                                rgb: [75, 0, 130],
                                visible: true
                            }
                        }
                    };
                    onSuccess(data);
                    break;
                }
                case 'progress': {
                    onProgress(value);
                    break;
                }
                case 'err': {
                    console.error(value);
                    onError(value);
                    break;
                }
                default:
                    break;
            }
        };
    }

    setGcodeObj3dVisibility(visible) {
        if (this.gcodeObj3d) {
            this.gcodeObj3d.visible = visible;
        }
    }

    setLayerCountVisible(value) {
        if (this.gcodeObj3d) {
            this.gcodeObj3d.material.uniforms.u_visible_layer_count.value = value;
        }
    }

    setLineTypeVisibility(visibility) {
        if (this.gcodeObj3d) {
            const uniforms = this.gcodeObj3d.material.uniforms;
            uniforms.u_wall_inner_visible.value = visibility['WALL-INNER'].visible ? 1 : 0;
            uniforms.u_wall_outer_visible.value = visibility['WALL-OUTER'].visible ? 1 : 0;
            uniforms.u_skin_visible.value = visibility['SKIN'].visible ? 1 : 0;
            uniforms.u_skirt_visible.value = visibility['SKIRT'].visible ? 1 : 0;
            uniforms.u_support_visible.value = visibility['SUPPORT'].visible ? 1 : 0;
            uniforms.u_fill_visible.value = visibility['FILL'].visible ? 1 : 0;
            uniforms.u_travel_visible.value = visibility['TRAVEL'].visible ? 1 : 0;
            uniforms.u_unknown_visible.value = visibility['UNKNOWN'].visible ? 1 : 0;
        }
    }

    // updateLineTypeVisibility(type, visible) {
    //     if (this.gcodeObj3d) {
    //         const uniforms = this.gcodeObj3d.material.uniforms;
    //         const value = visible ? 1 : 0;
    //         switch (type) {
    //             case 'WALL-INNER':
    //                 uniforms.u_wall_inner_visible.value = value;
    //                 break;
    //             case 'WALL-OUTER':
    //                 uniforms.u_wall_outer_visible.value = value;
    //                 break;
    //             case 'SKIN':
    //                 uniforms.u_skin_visible.value = value;
    //                 break;
    //             case 'SKIRT':
    //                 uniforms.u_skirt_visible.value = value;
    //                 break;
    //             case 'SUPPORT':
    //                 uniforms.u_support_visible.value = value;
    //                 break;
    //             case 'FILL':
    //                 uniforms.u_fill_visible.value = value;
    //                 break;
    //             case 'TRAVEL':
    //                 uniforms.u_travel_visible.value = value;
    //                 break;
    //             case 'UNKNOWN':
    //                 uniforms.u_unknown_visible.value = value;
    //                 break;
    //             default:
    //                 break;
    //         }
    //     }
    // }

    destroyCurrentGcodeObj3d() {
        //TODO: 正确销毁Object3D
        this.rendererParent.remove(this.gcodeObj3d);
        this.gcodeObj3d = null;
    }

    addGcodeObj3d(gcodeObj3d) {
        this.destroyCurrentGcodeObj3d();
        this.gcodeObj3d = gcodeObj3d;
        this.rendererParent.add(this.gcodeObj3d);
    }
}

const p3dGcodeManager = new P3DGcodeManager();

export default p3dGcodeManager;
