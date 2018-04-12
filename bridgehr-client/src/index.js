import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import HRClient from './HRClient';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<HRClient />, document.querySelector('#root'));
registerServiceWorker();
