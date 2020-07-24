import {notification} from 'antd';
import i18next from 'i18next'

function preprocess(params) {
    if (params.message) params.message = i18next.t(params.message);
    if (params.description) params.description = i18next.t(params.description);
    return params;
}

export default {
    success: (params) => notification.success(preprocess(params)),
    close: (params) => notification.close(params),
    error: (params) => notification.error(preprocess(params)),
    info: (params) => notification.info(params),
    warning: (params) => notification.warning(params),
    open: (params) => notification.open(params),
    warn: (params) => notification.warn(params),
    config: (options) => notification.config(options),
    destroy: () => notification.destroy(),
}