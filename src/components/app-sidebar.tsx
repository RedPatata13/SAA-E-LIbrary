import { Calendar, Home, Search, Settings, Sidebar, LogOut, Users, Plus, History, BookOpen } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./ui/sheet"
import { Button } from "./ui/button"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../services/use-auth"
import { useState } from "react"
import { EbookSheet } from "./book-upload-sheet"
import type { EBook } from "../services/types"
import { toast } from "sonner"


export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isEbookSheetOpen, setIsEbookSheetOpen] = useState(false);
  // const [book, setBooks ] = useState<EBook[]>([]);

  const items = [
    // { title: "Dashboard", url: "/Dashboard", icon: Home },
    { title: "Library", url: "/Library", icon: BookOpen },
    { title: "History", url: "/History", icon: History },
    ...(user && user.isVerified)
      ? [{ title: "User Accounts", url: "/Users", icon: Users }]
      : [],
    { title: "Account", url: "/Account", icon: Settings },
  ];

  if (user === null) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  }

  const handleAddBook = () => {
    setIsEbookSheetOpen(true);
  }

  const handleEbookUploadSuccess = (ebook: EBook) => {
    console.log("Ebook uploaded successfully:", ebook);
    toast("E-Book Succesfully uploaded"); 
  }

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="m-2">
            <Sidebar className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-64 p-4 flex flex-col justify-between">
          
          <div className="space-y-4">
            {/* Add Book Button for verified users */}
            {user && user.isVerified && (
              <div className="mb-4">
                <Button 
                  onClick={handleAddBook}
                  className="w-full justify-start gap-2"
                  variant="default"
                >
                  <Plus className="h-4 w-4" />
                  Add Book
                </Button>
              </div>
            )}

            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-2">
                Application
              </h2>
              <nav className="flex flex-col space-y-1">
                {items.map((item) => {
                  const Icon = item.icon
                  const active = location.pathname === item.url
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                        ${active
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Bottom Logout Button */}
          <div className="border-t pt-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 -scale-x-100" />
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Ebook Upload Dialog */}
      <EbookSheet 
        open={isEbookSheetOpen}
        onClose={() => setIsEbookSheetOpen(false)}
        onUploadSuccess={handleEbookUploadSuccess}
      />
    </>
  )
}