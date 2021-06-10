import isEmpty from 'lodash/isEmpty';
import {gcodeToBufferGeometry} from './GcodeToBufferGeometry';

onmessage = (e) => {
    if (isEmpty(e.data) || isEmpty(e.data.fileUrl)) {
        postMessage({status: 'err', value: 'Data is empty'});
        return;
    }
    const {fileUrl} = e.data;

    gcodeToBufferGeometry(
        fileUrl,
        (progress) => {
            postMessage({status: 'progress', value: progress});
        },
        (err) => {
            console.error("web work err: " + JSON.stringify(err))
            postMessage({status: 'err', value: JSON.stringify(err)});
        }
    ).then((result) => {
        const {bufferGeometry, layerCount, bounds} = result;
        const positions = bufferGeometry.getAttribute('position').array;
        const colors = bufferGeometry.getAttribute('a_color').array;
        const layerIndices = bufferGeometry.getAttribute('a_layer_index').array;
        const typeCodes = bufferGeometry.getAttribute('a_type_code').array;

        const data = {
            status: 'succeed',
            value: {
                positions,
                colors,
                layerIndices,
                typeCodes,
                layerCount,
                bounds
            }
        };
        postMessage(
            data,
            [
                positions.buffer,
                colors.buffer,
                layerIndices.buffer,
                typeCodes.buffer
            ]
        );
    });
};
