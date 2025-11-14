const { contextBridge, ipcRenderer } = require("electron");

console.log('Preload script loaded'); // Add this

try {
  contextBridge.exposeInMainWorld("dbAPI", {
    addUser: (user) => {
      console.log('addUser called in preload with:', user);
      return ipcRenderer.invoke("add-user", user);
    },

    getUsers: () => ipcRenderer.invoke("get-users"),

    loaded: true,
    ping: () => ipcRenderer.invoke("ping"),
    getUserByUsername: (uid) => {
    
    },
    getEbooks: () => ipcRenderer.invoke("get-ebooks"),
    showFileDialog: () => ipcRenderer.invoke("show-file-dialog"),
    verifyUser: (username, passwordHash) => ipcRenderer.invoke("verify-user", username, passwordHash),
    loginUser: (username, passwordHash) => ipcRenderer.invoke("login-user", username, passwordHash),
    logoutUser: () => ipcRenderer.invoke("logout-user"),
    getCurrentUser: () => ipcRenderer.invoke("get-current-user"),
    uploadEbook: (ebookData) => ipcRenderer.invoke("upload-ebook", ebookData),
    removeEbook: (bookId) => ipcRenderer.invoke("remove-ebook", bookId),
    getEbooks: () => ipcRenderer.invoke("get-ebooks"),
    updateEbook: (ebookData) => ipcRenderer.invoke("update-ebook", ebookData),
    copyFileToAppData: (sourcePath, destinationFilename) => ipcRenderer.invoke("copy-file-to-appdata", sourcePath, destinationFilename),
  });
  console.log('dbAPI exposed successfully');
  
} catch (error) {
  console.error('Failed to expose dbAPI:', error);
}