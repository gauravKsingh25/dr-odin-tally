import React from 'react';
import ReactDOM from 'react-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../src/style.css'
import './i18n';

import App from './App';

import { Provider } from 'react-redux';
import { configureStore } from './redux/store';

ReactDOM.render(
    <Provider store={configureStore({})}>
        <App />
        <ToastContainer/>
    </Provider>,
    document.getElementById('root')
);
