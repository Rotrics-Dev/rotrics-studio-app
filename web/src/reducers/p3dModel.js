import File3dToBufferGeometryWorker from '../containers/p3d/lib/File3dToBufferGeometry.worker';
import * as THREE from 'three';
import p3dModelManager from "../containers/p3d/lib/p3dModelManager";
import Model3D from "../containers/p3d/lib/Model3D";

const ACTION_UPDATE_STATE = 'p3dModel/ACTION_UPDATE_STATE';

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
            const transformation = model ? model.transformation : null;
            const modelCount = p3dModelManager.rendererParent.children.length;
            dispatch(actions._updateState({model, transformation, modelCount}));
        });
        p3dModelManager.on("onChangeTransformation", (transformation) => {
            dispatch(actions._updateState({transformation}));
        });
    },
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    setRendererParent: (object3d) => {
        p3dModelManager.setRendererParent(object3d);
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
                    dispatch(actions._updateState({progress: value * 100, progressTitle: 'Loading model'}));
                    break;
                case 'err':
                    worker.terminate();
                    console.error(value);
                    dispatch(actions._updateState({progress: 0, progressTitle: 'Failed to load model'}));
                    break;
                default:
                    break;
            }
        };
    },
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
        console.log("undo");
        return {type: null};
    },
    redo: () => {
        console.log("redo");
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
};

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case ACTION_UPDATE_STATE: {
            return Object.assign({}, state, action.state);
        }
        default:
            return state;
    }
}
