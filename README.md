
---

# 📘 Project Documentation

## 🗄️ DB Mechanic

This application uses a **single JSON file** as its database since it’s scoped to run **on a single device** only.

### ⚙️ File Access & Security

The project uses **Electron**, which restricts direct file access from UI components and pages for security reasons.
Only the **Electron entry point** (`main.cjs`) can access files through libraries such as `fs` and `path`.

To access or modify the JSON database, updates must be made in **three key files**:

| File                   | Purpose                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| `electron/main.cjs`    | Electron entry point that defines API logic and file operations.                           |
| `electron/preload.cjs` | Preloads defined `ipcMain` handlers into the window.                                       |
| `src/global.d.ts`      | Declares global type definitions to make database functions accessible throughout the app. |

The **actual database logic** (read/write operations) is implemented in `main.cjs`.
The **preload script** exposes these APIs to the renderer process (the UI) via the `window` object.

### 🧠 Usage

Once properly configured, database APIs can be accessed in any component or page using:

```javascript
window.dbAPI.[method]
```

#### Example:

```javascript
const user = window.dbAPI.getCurrentUser();
```

---

## 🧩 Layout and Routing

The app uses **React** for UI rendering and **React Router** for navigation and layout management.

### 🔍 Overview

Layout and routing logic are defined in:

```
src/App.tsx
```

Within the `App.tsx` return block:

* **Login** and **Signup** routes are **outside** the `AppLayout`, meaning they do **not** use the default layout components (e.g., Header, Footer, Sidebar).
* Any routes **inside** the `AppLayout` are **projected into the default layout**, so they automatically include shared components like navigation bars and footers.

### 🧭 Routing Examples

#### Simple Route

```tsx
<Route path="/account" element={<PersonalAccount />} />
```

#### Route with Props

```tsx
<Route
  path="/library"
  element={<ELibrary books={books} refreshBooks={refreshBooks} />}
/>
```

#### Route with a Parameter

```tsx
<Route path="/page/:pageParam1" element={<PDFViewerPage books={books} />} />
```

#### Route with Multiple Parameters

```tsx
<Route path="/page/:paramParam1/:pageParam2" element={<BookPage books={books} />} />
```

---

## 🧾 Summary

* Database operations are restricted to the Electron main process for security.
* APIs are bridged to the renderer via `preload.cjs` and accessed globally through `window.dbAPI`.
* React Router defines the navigation system.
* `AppLayout` acts as the root layout for authenticated pages, while routes outside it handle standalone views (e.g., Login, Signup).

---

