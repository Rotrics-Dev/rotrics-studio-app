import React from 'react';
import ReactDom from 'react-dom';
import Index from './containers/Index.jsx';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import reducer from './reducers';

const reduxStore = createStore(reducer, applyMiddleware(thunk));

console.log("window.serverIp: " + window.serverIp);
if (!window.serverIp) {
    window.serverIp = "http://localhost:3002"
}
console.log("window.serverIp 2: " + window.serverIp);

ReactDom.render(
    <Provider store={reduxStore}>
        <Index/>
    </Provider>,
    document.getElementById('content')
);

