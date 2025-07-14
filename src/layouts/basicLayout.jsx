import { NavLink } from "react-router";
import TopMenuComponent from "../components/menu/topMenu";

function BasicLayout({children}) {
    return ( 
<>

  <TopMenuComponent/>    
  
  <div className="container mx-auto py-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {children}
  </div>
</>  
     );
}

export default BasicLayout;