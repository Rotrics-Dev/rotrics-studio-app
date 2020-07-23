import {notification} from 'antd';
import i18next from 'i18next'

const myNotificaton = {
    preprocess: (params) => {
        if (params.message) params.message = i18next.t(params.message);
        if (params.description) params.description = i18next.t(params.description);
        return params;
    },
    success: (params) => {
        notification.success(myNotificaton.preprocess(params));
    },
    close: (params) => {
        notification.close(params);
    },
    error: (params) => {
        notification.error(myNotificaton.preprocess(params));
    },
}
export default myNotificaton;