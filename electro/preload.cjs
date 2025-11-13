const { contextBridge, ipcRenderer } = require("electron");

console.log('Preload script loaded'); // Add this

try {
  contextBridge.exposeInMainWorld("dbAPI", {
    addUser: (user) => {
      console.log('addUser called in preload with:', user);
      return ipcRenderer.invoke("add-user", user);
    },
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
    updateEbook: (ebookData) => ipcRenderer.invoke("update-ebook", ebookData),
    copyFileToAppData: (sourcePath, destinationFilename) => ipcRenderer.invoke("copy-file-to-appdata", sourcePath, destinationFilename),
    updateUsername: (uid, newUsername) => ipcRenderer.invoke("update-username", { uid, newUsername }),
    requestPasswordReset: (username) => ipcRenderer.invoke("request-password-reset", { username }),
    changePassword: (uid, newPassword) => ipcRenderer.invoke("change-password", { uid, newPassword }),
    deactivateAccount: (uid) => ipcRenderer.invoke("deactivate-account", { uid }),

logoutUser: () => ipcRenderer.invoke("logout-user"),
  });
  console.log('dbAPI exposed successfully');
  
} catch (error) {
  console.error('Failed to expose dbAPI:', error);
}