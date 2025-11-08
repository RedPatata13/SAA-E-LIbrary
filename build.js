const { build } = require('electron-builder');
const { execSync } = require('child_process');

console.log('Building React app...');
execSync('vite build', { stdio: 'inherit' });

console.log('Building Electron app...');
build({
  config: {
    directories: {
      output: "release"
    },
    files: [
      "dist/**/*",
      "electro/**/*",
      "node_modules/**/*"
    ]
  }
}).then(() => {
  console.log('Electron app built successfully!');
}).catch((error) => {
  console.error('Build failed:', error);
});