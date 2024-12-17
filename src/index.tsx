
import React from 'react';
import ReactDOM from 'react-dom/client';
import './tailwind.css';
import App from './App';
import './output.css';
import './tailwind.css';
import '@fontsource/patrick-hand';
import '@fontsource/patrick-hand-sc';




const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
