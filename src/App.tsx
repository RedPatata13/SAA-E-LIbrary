import { HashRouter as BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./AppLayout";
import ELibrary from "./pages/ELibrary";
import { useEffect, useState } from "react";
import type { EBook, User, History } from "./services/types";
// import Collection from "./pages/collections";
import Login from "./pages/login";
import Signup from "./pages/sign-up";
import Dashboard from "./pages/dashboard";
import { AuthProvider } from "./services/types";
import PersonalAccount from "./pages/personal-account";
import PDFViewerPage from "./components/pdf-view";
import { Toaster } from "./components/ui/sonner";
import BookPage from "./pages/book-details";
import UserAccountsPage from "./pages/user-accounts";
import UserAccount from "./pages/user-account";
import HistoryPage from "./pages/collections";
// import type { User } from "./services/types";
// import { mockBooks } from "./services/mockData";

function App() {
  const [books, setBooks] = useState<EBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<User[]>([]);
  const [history, setHistory] = useState<History[]>([]);

  const loadEbooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const ebooksData = await window.dbAPI.getEbooks();
      setBooks(ebooksData);
    } catch (err) {
      setError('Failed to load ebooks');
      console.error('Error loading ebooks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const overlay = document.getElementById("loading-overlay");
    const root = document.getElementById("root");
    if (overlay) overlay.style.display = "none";
    if (root) root.style.display = "block";
    
    // Load real ebooks from the database
    loadEbooks();
  }, []);

  // You can pass the refresh function to components that might add new books
  const refreshBooks = () => {
    loadEbooks();
  };

  const loadAccounts = () => {
    // print('does something');
    // setAccounts= UserAccount;
    console.log("does something");
  }

  function refreshAccounts(): void {
    loadAccounts();
  }

  function refreshHistory(): void {
    console.log("does something");
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="*" element={<Login />}/>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route element={<AppLayout />}>
            <Route path="/read/:bookId" element={<PDFViewerPage books={books}/>} />
            <Route path="/Library" element={ <ELibrary books={books} refreshBooks={refreshBooks} /> } />
            <Route path="/History" element={ <HistoryPage histories={history} refreshHistories={refreshHistory}/>} />
            <Route path="/Users" element={<UserAccountsPage accounts={accounts} refreshAccounts={refreshAccounts} />} />
            <Route path="/account" element={<PersonalAccount />} />
            <Route path="/user:uid" element={<UserAccount />} />
            <Route path="/book/:bookId" element={<BookPage books={books}/>}/>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
        <Toaster richColors position="top-center" />
        {/* <Login /> */}
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
// import React from 'react'

// function App() {
//   return (
//     <div>
//       <h1>Hello from Electron!</h1>
//       <p>If you can see this, React is working!</p>
//     </div>
//   )
// }

// export default App