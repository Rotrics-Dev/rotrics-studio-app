import File3dToBufferGeometryWorker from '../workers/File3dToBufferGeometry.worker';
import * as THREE from 'three';
import p3dModelManager from "../P3D/p3dModelManager";
import Model3D from "../P3D/Model3D";

const ACTION_UPDATE_STATE = 'ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    progress: 0,
    progressTitle: ""
};

export const actions = {
    updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
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

                    console.log("bufferGeometry: " + JSON.stringify(bufferGeometry));
                    const model3d = new Model3D(bufferGeometry, convexBufferGeometry, url, url);
                    p3dModelManager.addModel(model3d);
                    // dispatch(actions.displayModel());
                    // dispatch(actions.destroyGcodeLine());
                    break;
                }
                case 'progress':
                    dispatch(actions.updateState({
                        progress: value * 100,
                        progressTitle: 'Loading model...'
                    }));
                    break;
                case 'err':
                    worker.terminate();
                    console.error(value);
                    dispatch(actions.updateState({
                        progress: 0,
                        progressTitle: 'Failed to load model.'
                    }));
                    break;
                default:
                    break;
            }
        };
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
