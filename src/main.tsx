import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('main.tsx is executing');

// Remove any existing loading screen
const loadingElement = document.getElementById('loading');
if (loadingElement) {
  console.log('Removing loading screen');
  loadingElement.style.display = 'none';
  loadingElement.remove();
}

try {
  const rootElement = document.getElementById('root');
  const overlay = document.getElementById('loading-overlay');
  


  console.log('Root element:', rootElement);
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  rootElement.style.display = 'block';
  rootElement.style.visibility = 'true';

  if(overlay != null){
    overlay.style.display = 'none';
    console.log('overlay removed');
    
  }
  const root = ReactDOM.createRoot(rootElement);
  console.log('React root created');
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  


  console.log('App rendered');
} catch (error) {
  console.error('Error mounting React app:', error);
}