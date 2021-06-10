import packageJson from "../../../electron/package.json";

/**
 * code1>code2:return 1
 * code1=code2:return 0
 * code1<code2:return -1
 *
 * EXAMPLE:compareVersionCode('V1.1.1', 'V1.2.1')
 */
const compareVersionCode = (code1, code2) => {
    code1 = code1.slice(1, code1.length).trim();
    code2 = code2.slice(1, code2.length).trim();
    let code1arr = code1.split('.');
    let code2arr = code2.split('.');
    const fractionCount = Math.max(code1arr.length, code2arr.length);

    for (let index = 0; index < fractionCount; index++) {
        const fraction1 = code1arr[index] ? parseInt(code1arr[index].trim()) : 0;
        const fraction2 = code2arr[index] ? parseInt(code2arr[index].trim()) : 0;
        if (fraction1 > fraction2) {
            return 1;
        } else if (fraction1 < fraction2) {
            return -1;
        }
    }
    return 0;
}
/**
 * Version:{
        "id": 21,
        "version": "V0.1.7",
        "status": 1,
        "createUser": null,
        "url": "https://rotrics.oss-cn-shenzhen.aliyuncs.com/frimware/0b666355-cb09-42b1-a4bf-f252cb8e3aae/Rotrics Studio-0.1.7.dmg",
        "type": 2,
        "infos": [],
        "createTime": 1599100620,
        "updateTime": null
      }
 * */
const getLatestVersion = (version1, version2) => {
    if (!version1) return version2;
    if (!version2) return version1;
    return compareVersionCode(version1.version, version2.version) >= 0 ? version1 : version2;
}

const URL_SOFTWARE_VERSION = 'http://api.rotrics.com/version/soft/list';

const getSoftwareVersionList = async (page, pageSize) => {
    return await fetch(URL_SOFTWARE_VERSION + `?page=${page}&pageSize=${pageSize}`).then(response => response.json())
}

/**
 * 目前由于API不支持查询版本的总条数，所以只能从第一页开始查，当某一页没有查询到数据时，返回之前查到的最新版本
 * */
const getLatestSoftwareVersion = async () => {
    const VERSION_ENABLED = 1;//软件已经启用，否则禁用
    const pageSize = 20;
    const platform = navigator.platform.toLowerCase();
    const platformType = platform.startsWith('win') ? 1 : platform.startsWith('mac') ? 2 : 3;
    let latestVersion = null;
    for (let page = 0; page < 3; page++) {
        const response = await getSoftwareVersionList(page, pageSize);
        if (response.code !== 200) return;
        if (!response.data) return;
        if (!response.data.list) return;

        if (!response.data.list.length) {
            return latestVersion
        } else {
            response.data.list.forEach((version) => {
                if (platformType === version.type && version.status === VERSION_ENABLED) {
                    latestVersion = getLatestVersion(latestVersion, version)
                }
            });
        }
    }
};
/**
 * 只在查询到新版本时回调 onNewVersion
 * @param onNewVersion
 */
const checkUpdate = (onNewVersion) => {
    setTimeout(async () => {
        const latestVersionData = await getLatestSoftwareVersion();
        if (!latestVersionData) return;//没有找到任何版本信息

        const currentVersion = `V${packageJson.version}`;//获取当前版本
        if (compareVersionCode(latestVersionData.version, currentVersion) === 1) {//需要升级更新
            const now = new Date().getTime() / 1000;//获取当前时间秒的时间戳
            const delay = now - latestVersionData.createTime;
            if (delay > 60 * 60 * 48) {//软件发布之后延时48小时提醒用户更新
                onNewVersion(latestVersionData);
            }
        } else {//已经是最新版本
            console.log('It\'s the latest version of the software already!')
        }
    }, 10 * 1000);//启动10秒后开启查询
}

export default checkUpdate;