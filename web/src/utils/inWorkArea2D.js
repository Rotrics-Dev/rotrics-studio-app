const createCircle = (x = 0, y = 0, radius) => {
    return {
        x, y, radius
    }
}
const createRectAABB = (x, y, w, h) => {
    return {
        x, y, w, h
    }
}
/**
 *
 * @param xPosition
 * @param yPosition
 * @param w
 * @param h
 * @param r
 * @returns {boolean|boolean}
 */
const belowXAxis = (xPosition, yPosition, w, h, r) => {
    return (
        checkBelow(xPosition, yPosition, -w / 2, +h / 2, r) ||
        checkBelow(xPosition, yPosition, +w / 2, +h / 2, r) ||
        checkBelow(xPosition, yPosition, +w / 2, -h / 2, r) ||
        checkBelow(xPosition, yPosition, -w / 2, -h / 2, r)
    )
}
const checkBelow = (xPosition, yPosition, x0, y0, r) => {
    let {y} = rotate(x0, y0, r);
    return yPosition + y < 0;
}
/**
 *
 * @param circle
 * @param rect
 * @returns {boolean} return true if the rect is in the circle.
 */
const inCircle = (circle, rect) => {
    const farthestX = getFarthest(circle.x, rect.x - rect.w / 2, rect.x + rect.w / 2);
    const farthestY = getFarthest(circle.y, rect.y - rect.h / 2, rect.y + rect.h / 2);
    const distance = pointToPointDistance(circle.x, circle.y, farthestX, farthestY);
    return distance <= circle.radius;
}
/**
 * @param circle
 * @param rect
 * @returns {boolean} returns true if a collision is detected.
 */
const collisionDetectionCircleAABB = (circle, rect) => {
    const nearestX = getNearest(circle.x, rect.x - rect.w / 2, rect.x + rect.w / 2);
    const nearestY = getNearest(circle.y, rect.y - rect.h / 2, rect.y + rect.h / 2);
    const distance = pointToPointDistance(circle.x, circle.y, nearestX, nearestY);
    return distance <= circle.radius;
}

const getNearest = (target, min, max) => {
    if (target < min) {
        return min;
    } else if (target > max) {
        return max;
    } else {
        return target;
    }
}
const getFarthest = (target, min, max) => {
    if (target < min) {
        return max;
    }
    if (target > max) {
        return min;
    }
    if (max - target > target - min) {
        return max
    } else {
        return min;
    }
}


/**
 * 逆时针旋转
 * @param x
 * @param y
 * @param r deg
 * @returns {{x: number, y: number}}
 */
const rotate = (x, y, r) => {
    const theta = r / 180 * Math.PI;
    return {
        x: Math.cos(theta) * x - Math.sin(theta) * y,
        y: Math.sin(theta) * x + Math.cos(theta) * y
    }
}

/**
 *
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @returns distance
 */
const pointToPointDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}
/**
 * base on Circle to AABB(axis-aligned bounding boxes) collision detection
 * @param minRadius work area minRadius
 * @param maxRadius work area maxRadius
 * @param xPosition rect position x
 * @param yPosition rect position y
 * @param w width
 * @param h height
 * @param r rotation
 * @returns {boolean} re
 */
const inWorkArea2D = (minRadius, maxRadius, xPosition, yPosition, w, h, r) => {
    if (belowXAxis(xPosition, yPosition, w, h, r)) {
        return false;
    }
    const {x, y} = rotate(-xPosition, -yPosition, -r);
    const innerCircle = createCircle(x, y, minRadius);
    const OuterCircle = createCircle(x, y, maxRadius);
    const rect = createRectAABB(0, 0, w, h);
    if (!inCircle(OuterCircle, rect)) {
        return false;
    }
    if (collisionDetectionCircleAABB(innerCircle, rect)) {
        return false;
    }
    return true;
}
export default inWorkArea2D