import type { ReactNode } from "react"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"

type LayoutProp = {
  children : ReactNode,
  showSidebar?: boolean
}

const Layout = ({children, showSidebar  = false}: LayoutProp) => {
  return (
    <div className="min-h-screen">
        <div className="flex">
            {showSidebar && <Sidebar />}
            <div className="flex-1 flex flex-col">
            <Navbar />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
        </div>
    </div>
  )
}

export default Layout