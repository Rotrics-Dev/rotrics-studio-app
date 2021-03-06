import * as THREE from 'three';

const UNIFORMS = {
    // rgba
    u_g1_color: new THREE.Uniform(new THREE.Vector4(0, 0, 0, 1))
};

const CNC_LASER_VERT_SHADER = [
    'varying float v_g_code;',
    'attribute float a_g_code;',
    'void main(){',
    '    v_g_code = a_g_code;',
    '    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'
].join('');

const CNC_LASER_FRAG_SHADER = [
    'uniform vec4 u_g1_color;',
    'varying float v_g_code;',
    'void main(){',
    '    if(v_g_code == 0.0){',
    '        discard;',
    '    }',
    '    gl_FragColor = u_g1_color;',
    '}'
].join('');

const motionColor = {
    'G0': new THREE.Color(0xc8c8c8),
    'G1': new THREE.Color(0x000000),
    'unknown': new THREE.Color(0x000000)
};

class ToolPathRenderer {
    constructor() {
        this.data = [];
    }

    renderToLine(toolPathLines) {
        const positions = [];
        const gCodes = [];

        let state = {
            G: 0,
            X: 0,
            Y: 0,
            Z: 0
        };
        for (let i = 0; i < toolPathLines.length; i++) {
            const lineObj = toolPathLines[i];
            const newState = {...state};
            lineObj.G !== undefined && (newState.G = lineObj.G);
            lineObj.X !== undefined && (newState.X = lineObj.X);
            lineObj.Y !== undefined && (newState.Y = lineObj.Y);
            lineObj.Z !== undefined && (newState.Z = lineObj.Z);

            if ((state.G === 1) && (newState.G === 0)) {
                positions.push(state.X);
                positions.push(state.Y);
                positions.push(state.Z);
                gCodes.push(newState.G);
            }

            if (state.G !== newState.G ||
                state.X !== newState.X ||
                state.Y !== newState.Y ||
                state.Z !== newState.Z) {
                state = newState;
                positions.push(state.X);
                positions.push(state.Y);
                positions.push(state.Z);
                gCodes.push(state.G);
            }
        }

        const bufferGeometry = new THREE.BufferGeometry();
        const positionAttribute = new THREE.Float32BufferAttribute(positions, 3);
        const gCodeAttribute = new THREE.Float32BufferAttribute(gCodes, 1);
        bufferGeometry.setAttribute('position', positionAttribute);
        bufferGeometry.setAttribute('a_g_code', gCodeAttribute);
        const material = new THREE.ShaderMaterial({
            uniforms: UNIFORMS,
            vertexShader: CNC_LASER_VERT_SHADER,
            fragmentShader: CNC_LASER_FRAG_SHADER,
            side: THREE.DoubleSide,
            transparent: true,
            linewidth: 1
        });
        return new THREE.Line(bufferGeometry, material);
    }

    renderToPoints(toolPathLines) {
        const geometry = new THREE.Geometry();
        //TODO：
        //dwell time会影响point颜色深浅
        //size被什么影响呢？
        const material = new THREE.PointsMaterial({
            size: 0.4,
            vertexColors: THREE.VertexColors,
            opacity: 0.9,
            transparent: true
        });
        let state = {
            G: 0,
            X: 0,
            Y: 0,
            Z: 0
        };
        for (let i = 0; i < toolPathLines.length; i++) {
            const item = toolPathLines[i];
            const newState = {...state};
            item.G !== undefined && (newState.G = item.G);
            item.X !== undefined && (newState.X = item.X);
            item.Y !== undefined && (newState.Y = item.Y);
            item.Z !== undefined && (newState.Z = item.Z);

            if (state.G !== newState.G ||
                state.X !== newState.X ||
                state.Y !== newState.Y ||
                state.Z !== newState.Z) {
                state = newState;
                geometry.vertices.push(new THREE.Vector3(state.X, state.Y, state.Z));
                if (state.G === 0) {
                    geometry.colors.push(motionColor.G0);
                } else if (state.G === 1) {
                    geometry.colors.push(motionColor.G1);
                } else {
                    geometry.colors.push(motionColor.unknown);
                }
            }
        }
        return new THREE.Points(geometry, material);
    }
}

const toolPathRenderer = new ToolPathRenderer();

export default toolPathRenderer;
