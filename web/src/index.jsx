import React from 'react';
import ReactDom from 'react-dom';
import Index from './containers/Index.jsx';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import isElectron from 'is-electron';
import thunk from 'redux-thunk';
import reducer from './reducers';

const reduxStore = createStore(reducer, applyMiddleware(thunk));

const electron = isElectron();
console.log("is electron: " + electron);
if (!electron) {
    window.serverIp = "http://localhost:9000"
}
console.log("serverIp: " + window.serverIp);

ReactDom.render(
    <Provider store={reduxStore}>
        <Index/>
    </Provider>,
    document.getElementById('content')
);

