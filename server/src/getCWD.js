import isElectron from 'is-electron';
import path from 'path';

const isPackagedElectron = false;

/**
 * 获取当前运行环境下，current work directory
 * 开发环境下(local server)：
 * run in electron dev
 * run in packaged electron app
 * 两个地方用到：
 * 1. start-server.js：cura engine config路径，http static路径
 * 2. p3dStartSlice.js：cura engine路径，cura engine config路径
 */
const getCWD = () => {
    // 开发环境（local server）或 run in electron dev
    // node进程是从/server/package.json启动
    if (!isElectron() || !isPackagedElectron) {
        return path.resolve(); // => /
    }

    // run in packaged electron app
    // __dirname为/Users/liuming/Documents/github/rotrics/rotrics-studio-app/electron/output/mac/Rotrics Stduio.app/Contents/Resources/app/build-server
    // cwd是app，因此需要向上一级
    return path.join(__dirname, './..');
};

export default getCWD;
