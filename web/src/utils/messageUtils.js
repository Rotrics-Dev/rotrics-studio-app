import {message} from 'antd';
import i18next from 'i18next'

const myMessage = {
    info: (content, duration, onClose) => message.info(i18next.t(content), duration, onClose),
    success: (content, duration, onClose) => message.success(i18next.t(content), duration, onClose),
    error: (content, duration, onClose) => message.error(i18next.t(content), duration, onClose),
    warn: (content, duration, onClose) => message.warn(i18next.t(content), duration, onClose),
    warning: (content, duration, onClose) => message.warning(i18next.t(content), duration, onClose),
    loading: (content, duration, onClose) => message.loading(i18next.t(content), duration, onClose),
    open: (args) => message.open(args),
    config: (options) => message.config(options),
    destroy: () => message.destroy()
}
export default myMessage;