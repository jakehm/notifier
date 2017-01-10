import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

require('dotenv').config({ silent: process.env.NODE_ENV === 'production' })


ReactDOM.render(
  <App />,
  document.getElementById('root')
);
