import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import SampleExtensionContent from './SampleExtensionContent'
import reportWebVitals from './reportWebVitals';
/*
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
*/
let div = document.createElement('div');
div.id = 'foo';
document.body.prepend(div);


ReactDOM.render(
  <React.StrictMode>
    <SampleExtensionContent/>
  </React.StrictMode>,
  document.getElementById('foo')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
