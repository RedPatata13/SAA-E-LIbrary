const { app, BrowserWindow, ipcMain, protocol, dialog } = require("electron");
const path = require("path");
const fs = require("fs").promises;
const fsSync = require('fs');
const { User } = require("lucide-react");

const preload = path.join(__dirname, "preload.cjs");

let mainWindow;
const dbPath = path.join(app.getPath("userData"), "db.json");
const templatePath = path.join(__dirname, "template.json");
const ebooksDir = path.join(app.getPath("userData"), "ebooks");

function ensureDirectoriesExist() {
  if (!fsSync.existsSync(app.getPath("userData"))) {
    fsSync.mkdirSync(app.getPath("userData"), { recursive: true });
  }
  
  if (!fsSync.existsSync(ebooksDir)) {
    fsSync.mkdirSync(ebooksDir, { recursive: true });
    console.log("Created ebooks directory:", ebooksDir);
  }
  
  ensureDBExists();
}

function ensureDBExists() {
  if (!fsSync.existsSync(dbPath)) {
    console.log("Database not found — creating a new one...");
    if (fsSync.existsSync(templatePath)) {
      fsSync.copyFileSync(templatePath, dbPath);
      console.log("Database created from template!");
    } else {
      const initialData = {
        users: [],
        ebooks: [],
        currentUserId: null,
      };
      fsSync.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
      console.log("Database created with initial structure!");
    }
  }
}

function readDB() {
  ensureDBExists();
  const data = fsSync.readFileSync(dbPath, "utf8");
  const db = JSON.parse(data);

  if (!db.users) db.users = [];
  if (!db.ebooks) db.ebooks = [];
  if (!db.hasOwnProperty("currentUserId")) db.currentUserId = null;

  return db;
}

function writeDB(data) {
  if (!data.users) data.users = [];
  if (!data.ebooks) data.ebooks = [];
  if (!data.hasOwnProperty("currentUserId")) data.currentUserId = null;

  fsSync.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function ensureAdminUser() {
  const db = readDB();
  const adminExists = db.users.some(user => user.username === "Admin" && user.isVerified);

  if (!adminExists) {
    console.log("Admin user not found — creating default admin...");
    const adminUser = {
      uid: Date.now().toString(),
      username: "Admin",
      passwordHash: btoa("AdminKey1"),
      isVerified: true,
      temporaryPass: "",
      temporaryPassExpirationDate: null
    };
    db.users.push(adminUser);
    writeDB(db);
    console.log("Default Admin user created with password 'AdminKey1'");
  } else {
    console.log("Admin user already exists.");
  }
}

function createWindow() {
  ensureAdminUser();
  ensureDBExists();
  
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    title: "SAA E-Library",
    icon: path.join(__dirname, '../assets/favicon.ico')
  });

  mainWindow.removeMenu();

  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    const possiblePaths = [
      path.join(__dirname, '../dist/index.html'),
      path.join(__dirname, '../../dist/index.html'),
      path.join(process.resourcesPath, 'dist/index.html')
    ];
    
    let loaded = false;
    for (const filePath of possiblePaths) {
      try {
        mainWindow.loadFile(filePath);
        console.log('Loaded from:', filePath);
        loaded = true;
        break;
      } catch (error) {
        console.log('Failed to load from:', filePath);
      }
    }
    
    if (!loaded) {
      console.error('Could not find index.html in any expected location');
    }
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    app.quit();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle("read-db", async () => {
  ensureDBExists();
  console.log("Reading database...");
  const data = fsSync.readFileSync(dbPath, "utf8");
  return JSON.parse(data);
});

ipcMain.handle("write-db", async (_, newData) => {
  fsSync.writeFileSync(dbPath, JSON.stringify(newData, null, 2));
});

ipcMain.handle("add-user", async (_, newUser) => {
  const db = readDB();
  db.users = db.users || [];
  db.users.push({
    uid: newUser.uid,
    username: newUser.username,
    passwordHash: newUser.passwordHash,
    isVerified: newUser.isVerified || false,
    temporaryPass: newUser.temporaryPass || "",
    temporaryPassExpirationDate: newUser.temporaryPassExpirationDate || null,
  });
  writeDB(db);
  console.log("User added!");
  return db.users;
});

ipcMain.handle("verify-user", async (_, username, passwordHash) => {
  const db = readDB();
  const user = db.users.find(u => u.username === username);

  if (!user) {
    return { success: false, message: "User not found" };
  }

  if (atob(user.passwordHash) !== passwordHash) {
    return { success: false, message: "Invalid password" };
  }

  if (!user.isVerified) {
    return { success: false, message: "Account not yet verified" };
  }

  return { success: true, user };
});

ipcMain.handle("login-user", async (_, username, passwordHash) => {
  try {
    const db = readDB();
    if (!db.users || !Array.isArray(db.users)) {
      return { success: false, message: "Database error: No users found" };
    }

    const user = db.users.find(u => u.username === username);
    if (!user) return { success: false, message: "User not found" };
    if (!user.passwordHash) return { success: false, message: "Invalid user data" };
    if (atob(user.passwordHash) !== passwordHash) return { success: false, message: "Invalid password" };

    console.log("Login successful for user:", username);
    db.currentUserId = user.uid;
    writeDB(db);

    return { success: true, user };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Login failed due to system error" };
  }
});

ipcMain.handle("logout-user", async () => {
  const db = readDB();
  db.currentUserId = null;
  writeDB(db);
  return { success: true };
});

ipcMain.handle("get-current-user", async () => {
  const db = readDB();
  const user = db.users.find(u => u.uid === db.currentUserId);
  return user || null;
});

ipcMain.handle("copy-file-to-appdata", async (_, sourcePath, destinationFilename) => {
  try {
    ensureDirectoriesExist();
    const destinationPath = path.join(ebooksDir, destinationFilename);
    await fs.copyFile(sourcePath, destinationPath);
    return { success: true, destinationPath };
  } catch (error) {
    console.error("File copy error:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("upload-ebook", async (_, ebookData) => {
  try {
    ensureDirectoriesExist();
    const db = readDB();
    const ebookId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const safeTitle = ebookData.title.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileExtension = path.extname(ebookData.fileName) || ".pdf";
    const destinationFilename = `${safeTitle}_${ebookId}${fileExtension}`;
    const destinationPath = path.join(ebooksDir, destinationFilename);

    await fs.copyFile(ebookData.filePath, destinationPath);
    const stats = await fs.stat(destinationPath);
    const protocolUrl = `ebooks://${destinationFilename}`;

    const ebook = {
      id: ebookId,
      title: ebookData.title,
      author: ebookData.author,
      publisher: ebookData.publisher,
      doi: ebookData.doi || null,
      filePath: protocolUrl,
      fileName: destinationFilename,
      fileSize: stats.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: db.currentUserId || "unknown"
    };

    db.ebooks = db.ebooks || [];
    db.ebooks.push(ebook);
    writeDB(db);

    console.log("✅ Ebook uploaded:", ebook.title, "→", protocolUrl);
    console.log("📁 Physical location:", destinationPath);

    return { success: true, ebook };
  } catch (error) {
    console.error("❌ Ebook upload error:", error);
    return { success: false, message: "Upload failed: " + error.message };
  }
});

ipcMain.handle("show-file-dialog", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
  });
  return result;
});

ipcMain.handle("get-ebooks", async () => {
  try {
    const db = readDB();
    if (!db.ebooks || !Array.isArray(db.ebooks)) return [];

    const enrichedEbooks = await Promise.all(
      db.ebooks.map(async (ebook) => {
        const fileName = ebook.fileName || path.basename(ebook.filePath || "");
        const filePath = path.join(ebooksDir, fileName);
        try {
          const fileBuffer = await fs.readFile(filePath);
          const base64Data = fileBuffer.toString("base64");
          return { ...ebook, base64Data };
        } catch (err) {
          console.warn(`⚠️ Could not read file for ebook ${ebook.title}:`, err.message);
          return { ...ebook, base64Data: null };
        }
      })
    );

    console.log(`✅ Returned ${enrichedEbooks.length} ebooks with base64 data.`);
    return enrichedEbooks;
  } catch (error) {
    console.error("❌ Error getting ebooks:", error);
    return [];
  }
});

ipcMain.handle("get-ebook-file-path", async (_, ebookFileName) => {
  const filePath = path.join(ebooksDir, ebookFileName);
  return {
    protocolUrl: `ebooks://${ebookFileName}`,
    physicalPath: filePath,
    exists: fsSync.existsSync(filePath)
  };
});

ipcMain.handle("check-file-exists", async (_, filePath) => {
  try {
    await fs.access(filePath);
    return { exists: true };
  } catch {
    return { exists: false };
  }
});

ipcMain.handle("remove-ebook", async (_, bookId) => {
  try {
    ensureDBExists();
    const db = readDB();

    db.ebooks = db.ebooks || [];
    const bookIndex = db.ebooks.findIndex(eb => eb.id === bookId);

    if (bookIndex === -1) {
      return { success: false, message: "Ebook not found" };
    }

    const book = db.ebooks[bookIndex];
    const fileName = book.fileName || path.basename(book.filePath || "");
    const filePath = path.join(ebooksDir, fileName);

    try {
      if (fsSync.existsSync(filePath)) {
        await fs.unlink(filePath);
        console.log(`🗑️ Deleted ebook file: ${filePath}`);
      } else {
        console.warn(`⚠️ Ebook file not found on disk: ${filePath}`);
      }
    } catch (fileError) {
      console.error("❌ Failed to delete ebook file:", fileError.message);
    }

    db.ebooks.splice(bookIndex, 1);
    writeDB(db);

    console.log(`✅ Ebook removed from DB: ${book.title}`);
    return { success: true, message: "Ebook removed successfully" };
  } catch (error) {
    console.error("❌ Error removing ebook:", error);
    return { success: false, message: "Failed to remove ebook: " + error.message };
  }
});

ipcMain.handle("get-user-data-path", async () => {
  return app.getPath("userData");
});

ipcMain.handle("update-ebook", async (_, updatedData) => {
  try {
    const db = readDB();
    const bookIndex = db.ebooks.findIndex((b) => b.id === updatedData.id);
    if (bookIndex === -1) return { success: false, message: "Book not found" };

    db.ebooks[bookIndex] = {
      ...db.ebooks[bookIndex],
      title: updatedData.title ?? db.ebooks[bookIndex].title,
      author: updatedData.author ?? db.ebooks[bookIndex].author,
      publisher: updatedData.publisher ?? db.ebooks[bookIndex].publisher,
      doi: updatedData.doi ?? db.ebooks[bookIndex].doi,
      updatedAt: new Date().toISOString(),
      updatedBy: db.currentUserId || "unknown"
    };

    if (updatedData.filePath) {
      const fileExtension = path.extname(updatedData.fileName) || ".pdf";
      const safeTitle = updatedData.title.replace(/[^a-zA-Z0-9.-]/g, "_");
      const ebookId = db.ebooks[bookIndex].id;
      const destinationFilename = `${safeTitle}_${ebookId}${fileExtension}`;
      const destinationPath = path.join(ebooksDir, destinationFilename);

      await fs.copyFile(updatedData.filePath, destinationPath);
      db.ebooks[bookIndex].filePath = `ebooks://${destinationFilename}`;
      db.ebooks[bookIndex].fileName = destinationFilename;
      db.ebooks[bookIndex].fileSize = (await fs.stat(destinationPath)).size;
    }

    writeDB(db);
    return { success: true, ebook: db.ebooks[bookIndex] };
  } catch (error) {
    console.error("❌ Ebook update error:", error);
    return { success: false, message: "Update failed: " + error.message };
  }
});

ipcMain.handle("get-users", (_) => {
  let arr = [];
  try {
    const db = readDB();
    db.users = db.users || [];
    return { users };
  } catch (error) {
    console.log("Unknown errror has occured on fetching the users");
    return { arr };
  }
});

ipcMain.handle('update-username', async (_, { uid, newUsername }) => {  // ← Changed this line
  try {
    console.log("📝 update-username called with:", { uid, newUsername });
    const db = readDB();
    
    // Check if username already exists
    const usernameExists = db.users.some(u => u.username === newUsername && u.uid !== uid);
    if (usernameExists) {
      return { success: false, message: "Username already taken" };
    }

    // Find and update user
    const userIndex = db.users.findIndex(u => u.uid === uid);
    if (userIndex === -1) {
      return { success: false, message: "User not found" };
    }

    db.users[userIndex].username = newUsername;
    writeDB(db);
    
    console.log(`✅ Username updated for user ${uid}: ${newUsername}`);
    return { success: true, message: "Username updated successfully" };
  } catch (error) {
    console.error("❌ Error updating username:", error);
    return { success: false, message: "Failed to update username: " + error.message };
  }
});

ipcMain.handle('request-password-reset', async (_, { username }) => {  // ← Add destructuring
  try {
    console.log("🔑 request-password-reset called with:", username);
    const db = readDB();
    
    // Find user
    const userIndex = db.users.findIndex(u => u.username === username);
    if (userIndex === -1) {
      return { success: false, message: "User not found" };
    }

    // Generate temporary password (8 random characters)
    const tempPassword = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Set expiration to 24 hours from now
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 24);

    db.users[userIndex].temporaryPass = tempPassword;
    db.users[userIndex].temporaryPassExpirationDate = expirationDate.toISOString();
    
    writeDB(db);
    
    console.log(`✅ Temporary password generated for ${username}: ${tempPassword}`);
    console.log(`⏰ Expires: ${expirationDate.toISOString()}`);
    
    return { 
      success: true, 
      message: "Temporary password generated successfully",
      temporaryPass: tempPassword,
      expirationDate: expirationDate.toISOString()
    };
  } catch (error) {
    console.error("❌ Error generating temporary password:", error);
    return { success: false, message: "Failed to generate temporary password: " + error.message };
  }
});

ipcMain.handle('change-password', async (_, { uid, newPassword }) => {
  try {
    console.log("🔑 change-password called for uid:", uid);
    const db = readDB();
    
    // Find user
    const userIndex = db.users.findIndex(u => u.uid === uid);
    if (userIndex === -1) {
      return { success: false, message: "User not found" };
    }

    // Update password (encode with btoa like the rest of your system)
    db.users[userIndex].passwordHash = btoa(newPassword);
    
    // Clear temporary password if it exists
    db.users[userIndex].temporaryPass = null;
    db.users[userIndex].temporaryPassExpirationDate = null;
    
    writeDB(db);
    
    console.log(`✅ Password changed for user ${uid}`);
    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    console.error("❌ Error changing password:", error);
    return { success: false, message: "Failed to change password: " + error.message };
  }
});

ipcMain.handle('deactivate-account', async (_, { uid }) => {  // ← Add destructuring
  try {
    console.log("🗑️ deactivate-account called with:", uid);
    const db = readDB();
    
    // Don't allow deactivating Admin account
    const user = db.users.find(u => u.uid === uid);
    if (user && user.username === "Admin") {
      return { success: false, message: "Cannot deactivate Admin account" };
    }

    // Find user index
    const userIndex = db.users.findIndex(u => u.uid === uid);
    if (userIndex === -1) {
      return { success: false, message: "User not found" };
    }

    // Remove user from database
    const removedUser = db.users.splice(userIndex, 1)[0];
    
    // If this was the current user, log them out
    if (db.currentUserId === uid) {
      db.currentUserId = null;
    }

    // Optional: Remove user's reading history
    if (db.collections) {
      db.collections = db.collections.filter(c => c.userId !== uid);
    }

    writeDB(db);
    
    console.log(`✅ Account deactivated: ${removedUser.username} (${uid})`);
    return { success: true, message: "Account deactivated successfully" };
  } catch (error) {
    console.error("❌ Error deactivating account:", error);
    return { success: false, message: "Failed to deactivate account: " + error.message };
  }
});

ipcMain.handle("update-reading-status", async (_, pageNumber, bookId, userId) => {
  try {
    const db = readDB();
    db.collections = db.collections || [];

    const existingRecord = db.collections.find(
      (c) => c.bookId === bookId && c.userId === userId
    );

    if (existingRecord) {
      existingRecord.lastPage = pageNumber;
      existingRecord.updatedAt = new Date().toISOString();
      console.log(`📖 Updated reading status for user ${userId}, book ${bookId}`);
    } else {
      db.collections.push({
        id: Date.now().toString(),
        userId,
        bookId,
        lastPage: pageNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log(`📘 Created new reading status for user ${userId}, book ${bookId}`);
    }

    writeDB(db);
    return { success: true, message: "Reading status updated successfully" };
  } catch (error) {
    console.error("❌ Error updating reading status:", error);
    return { success: false, message: error.message };
  }
});

console.log("Electron main process started");
console.log("User data path:", app.getPath("userData"));
console.log("Ebooks directory:", ebooksDir);
