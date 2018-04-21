import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Form from './Form';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import registerServiceWorker from './registerServiceWorker';

const App = () => (
  <MuiThemeProvider>
    <Form />
  </MuiThemeProvider>
);

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
