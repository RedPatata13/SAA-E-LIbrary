// import { ThemeProvider } from "./theme-provider";
// import { ModeToggle } from "./mode-toggle";
// import { SearchButton } from "./search-button";
import SidebarMain from "./func-sidebar";
import { Outlet } from "react-router-dom";
// import ELibrary from "../pages/ELibrary";

export function Header( { head }  :{ head : string }) {
  return (
    <header className="w-full p-4 flex justify-between items-start overflow-y-hidden">
      <SidebarMain children={<Outlet />} head={head}/>
    </header>
  );
}
