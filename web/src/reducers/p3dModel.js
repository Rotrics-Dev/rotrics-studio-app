import File3dToBufferGeometryWorker from '../containers/p3d/lib/File3dToBufferGeometry.worker';
import * as THREE from 'three';
import p3dModelManager from "../containers/p3d/lib/p3dModelManager";
import Model3D from "../containers/p3d/lib/Model3D";

const SELECT_MODEL = 'p3dModel/SELECT_MODEL';
const SET_MODEL_COUNT = 'p3dModel/SET_MODEL_COUNT';

const SET_TRANSFORMATION = 'p3dModel/SET_TRANSFORMATION';

const SET_PROGRESS_INFO = 'p3dModel/SET_PROGRESS_INFO';

const INITIAL_STATE = {
    modelCount: 0,
    model: null,
    transformation: null,
    progress: 0,
    progressTitle: ""
};

export const actions = {
    init: () => (dispatch) => {
        p3dModelManager.on("onChangeModel", (model) => {
            dispatch(actions._setModelCount(p3dModelManager.modelsParent.children.length));
            dispatch(actions._selectModel(model));
        });
        p3dModelManager.on("onChangeTransformation", (transformation) => {
            dispatch(actions._setTransformation(_.cloneDeep(transformation)));
        });
    },
    setModelsParent: (modelsParent) => {
        p3dModelManager.setModelsParent(modelsParent);
        return {type: null};
    },
    loadModel: (url) => (dispatch, getState) => {
        const worker = new File3dToBufferGeometryWorker();
        worker.postMessage({url});
        worker.onmessage = (e) => {
            const data = e.data;
            const {status, value} = data;
            switch (status) {
                case 'succeed': {
                    worker.terminate();
                    const {modelPositions, modelConvexPositions} = value;

                    const bufferGeometry = new THREE.BufferGeometry();
                    const convexBufferGeometry = new THREE.BufferGeometry();

                    const modelPositionAttribute = new THREE.BufferAttribute(modelPositions, 3);
                    const modelConvexPositionAttribute = new THREE.BufferAttribute(modelConvexPositions, 3);

                    bufferGeometry.addAttribute('position', modelPositionAttribute);
                    bufferGeometry.computeVertexNormals();
                    convexBufferGeometry.addAttribute('position', modelConvexPositionAttribute);

                    const model = new Model3D(bufferGeometry, convexBufferGeometry, url, url);
                    p3dModelManager.addModel(model);
                    // dispatch(actions.displayModel());
                    // dispatch(actions.destroyGcodeLine());
                    break;
                }
                case 'progress':
                    dispatch(actions.setProgressInfo({
                        progress: value * 100,
                        progressTitle: 'Loading model...'
                    }));
                    break;
                case 'err':
                    worker.terminate();
                    console.error(value);
                    dispatch(actions.setProgressInfo({
                        progress: 0,
                        progressTitle: 'Failed to load model.'
                    }));
                    break;
                default:
                    break;
            }
        };
    },
    //modelsParent: three.Object3D
    selectModel: (model) => {
        p3dModelManager.selectModel(model);
        return {type: null};
    },
    removeSelected: () => {
        p3dModelManager.removeSelected();
        return {type: null};
    },
    removeAll: () => {
        p3dModelManager.removeAll();
        return {type: null};
    },
    duplicateSelected: () => {
        p3dModelManager.duplicateSelected();
        return {type: null};
    },
    undo: () => {
        console.log("undo")
        return {type: null};
    },
    redo: () => {
        console.log("redo")
        return {type: null};
    },
    layFlat: () => {
        p3dModelManager.layFlat();
        return {type: null};
    },
    updateTransformation: (key, value) => {
        p3dModelManager.updateTransformation(key, value);
        return {type: null};
    },
    afterUpdateTransformation: (key, value) => {
        p3dModelManager.afterUpdateTransformation(key, value);
        return {type: null};
    },
    _setModelCount: (count) => {
        return {
            type: SET_MODEL_COUNT,
            value: count
        };
    },
    _selectModel: (model) => {
        return {
            type: SELECT_MODEL,
            value: model
        };
    },
    _setTransformation: (transformatione) => {
        return {
            type: SET_TRANSFORMATION,
            value: transformatione
        };
    },
    setProgressInfo: (data) => {
        return {
            type: SET_PROGRESS_INFO,
            data
        };
    },
};

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case SELECT_MODEL:
            const model = action.value;
            if (model) {
                const transformation = model.transformation;
                return Object.assign({}, state, {model, transformation});
            } else {
                return Object.assign({}, state, {
                    model: null,
                    transformation: null,
                });
            }
        case SET_MODEL_COUNT:
            return Object.assign({}, state, {modelCount: action.value});
        case SET_TRANSFORMATION:
            return Object.assign({}, state, {transformation: action.value});
        case SET_PROGRESS_INFO:
            const {progress, progressTitle} = action.data;
            return Object.assign({}, state, {progress, progressTitle});

        default:
            return state;
    }
}
