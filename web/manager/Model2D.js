import * as THREE from 'three';

/**
 * 禁止修改scale
 * size：geometry计算得到
 */
class Model2D extends THREE.Mesh {
    constructor(fileType) {
        super();
        this.fileType = fileType;
        this.imageRatio = 1; //w/h
        this.width = 0;
        this.height = 0;
        this._isSelected = false;

        this.edgesLine = null;
    }

    loadImage(url, mWidth, mHeight) {
        const max_width = 100;
        const max_height = 100;

        const resize = (width, height) => {
            if (width <= max_width && height <= max_height) {
                return;
            }

            this.imageRatio = width / height;
            if (this.imageRatio > max_width / max_height) {
                width = max_width;
                height = width / this.imageRatio;
            } else {
                height = max_height;
                width = height * this.imageRatio;
            }
            return {width, height}
        };

        let {width, height} = resize(mWidth, mHeight);
        const loader = new THREE.TextureLoader();
        // loader.setCrossOrigin("anonymous");
        const texture = loader.load(url);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1,
            map: texture,
            side: THREE.DoubleSide
        });

        this.geometry = new THREE.PlaneGeometry(width, height);
        this.material = material;
        this.width = width;
        this.height = height;
    }

    //改变transformation
    setWidth(width) {
        const height = width / this.imageRatio;
        this.geometry = new THREE.PlaneGeometry(width, height);
        this.width = width;
        this.height = height;

        this._updateEdges();
    }

    setHeight(height) {
        const width = height * this.imageRatio;
        this.geometry = new THREE.PlaneGeometry(width, height);
        this.width = width;
        this.height = height;

        this._updateEdges();
    }

    setRotation(radian) {
        this.rotation.z = radian;
    }

    setX(x) {
        this.position.x = x;
    }

    setY(y) {
        this.position.y = y;
    }

    getState() {
        return {
            width: this.width,
            height: this.height,
            x: this.position.x,
            y: this.position.y,
            rotation: this.rotation.z
        }
    }

    setSelected(isSelected) {
        this._isSelected = isSelected;

        if (!this.edgesLine) {
            const edges = new THREE.EdgesGeometry(this.geometry);
            this.edgesLine = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0xff0000}));
            this.add(this.edgesLine)
        }

        this.edgesLine.visible = this._isSelected


        console.log("this._isSelected: " + this._isSelected)
    }

    _updateEdges() {
        this.edgesLine.geometry = new THREE.EdgesGeometry(this.geometry)
    }

}

export default Model2D;
