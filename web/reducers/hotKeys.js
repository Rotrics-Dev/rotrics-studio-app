import hotKeys from 'hotkeys-js';
import laserManager from "../containers/laser/lib/laserManager.js";

//放在redux中是为了方便管理，
//根绝当前的tap，执行不同的操作
//可以通过state，方便获取tap
export const actions = {
    init: () => {
        hotKeys('a', (event, handler) => {
            event.preventDefault();
        });
        hotKeys('backspace,del', (event, handler) => {
            event.preventDefault();
            laserManager.removeSelected();
        });
        return {
            type: ""
        };
    }
};

export default function reducer() {
    return {};
}
