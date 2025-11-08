import { AppSidebar } from "./app-sidebar"
import NavText from "./nav-text"
import { ThemeProvider } from "./theme-provider"
import { ModeToggle } from "./mode-toggle"
// import { SearchButton } from "./search-button"
import { AuthProvider } from "../services/types"
export default function SidebarMain({ children, head }: { children: React.ReactNode, head: string }) {
  return (
    <AuthProvider>
        <div className="flex flex-col min-h-screen w-full overflow-y-hidden">
        <header className="flex items-center border-b h-14 justify-between">
          <div className="flex gap-1 items-center">
            <AppSidebar /> 
            <NavText />
          </div>
          <div className="flex items-center gap-2">
              <ThemeProvider>
              <ModeToggle />
              </ThemeProvider>
              {/* <SearchButton /> */}
          </div>
        </header>
        
        <main className="flex-1 overflow-y-hidden p-4">
          {children}
        </main>
      </div>
    </AuthProvider>
    
  )
}
