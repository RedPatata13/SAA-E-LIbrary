// import { Outlet } from 'react-router-dom'
import { Header } from './components/header'
import { useState } from 'react'
// import { ThemeProvider } from './components/theme-provider';
// import { ModeToggle } from './components/mode-toggle';
// import { SearchButton } from './components/search-button';
// import NavText from './components/nav-text';
// import { Side } from './components/app-sidebar'
// import SidebarMain from './components/func-sidebar'

export default function AppLayout(){
    const [title] = useState("Home");
    return (
        <div className='flex h-screen'>
            {/* < SidebarMain children={null}/> */}
            {/* <NavText /> */}
            <div className='flex-1 flex flex-col'>
                <Header head={title}/>
                {/* <main className='p-4 overflow-y-auto'>
                    <Outlet context={{ setTitle }}/>
                </main> */}
            </div>
        </div>
    )
}