const { contextBridge, ipcRenderer } = require("electron");

console.log("Preload script loaded");

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

    updateUsername: (uid, newUsername) =>
      ipcRenderer.invoke("update-username", { uid, newUsername }),

    requestPasswordReset: (username) =>
      ipcRenderer.invoke("request-password-reset", { username }),

    changePassword: (uid, newPassword) =>
      ipcRenderer.invoke("change-password", { uid, newPassword }),

    deactivateAccount: (uid) =>
      ipcRenderer.invoke("deactivate-account", { uid }),

    // ---- EBOOKS ----
    getEbooks: () => ipcRenderer.invoke("get-ebooks"),

    uploadEbook: (ebookData) =>
      ipcRenderer.invoke("upload-ebook", ebookData),

    removeEbook: (bookId) =>
      ipcRenderer.invoke("remove-ebook", bookId),

    updateEbook: (ebookData) =>
      ipcRenderer.invoke("update-ebook", ebookData),

    copyFileToAppData: (sourcePath, destName) =>
      ipcRenderer.invoke("copy-file-to-appdata", sourcePath, destName),

    // ---- FILE DIALOG ----
    showFileDialog: () => ipcRenderer.invoke("show-file-dialog"),

    ping: () => ipcRenderer.invoke("ping"),

    loaded: true
  });

  console.log("dbAPI exposed successfully");

  // -------------------------------------------------------
  // 🔵 ADD THIS — expose reading history API
  // -------------------------------------------------------
  contextBridge.exposeInMainWorld("electronAPI", {
    readingHistory: {
      update: (historyData) =>
        ipcRenderer.invoke("readingHistory:update", historyData),

      get: (userId) =>
        ipcRenderer.invoke("readingHistory:get", userId),

      clear: (userId) =>
        ipcRenderer.invoke("readingHistory:clear", userId),
    },
  });

  console.log("readingHistory API exposed successfully");

} catch (error) {
  console.error("Failed to expose APIs:", error);
}
