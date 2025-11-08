import { useLocation } from "react-router-dom";
import { routes } from "../routes";

export default function NavText(){
    const location = useLocation();
    const title = routes[location.pathname.toLowerCase()] || 'App';

    return(
        <header className="text-lg font-medium">
            <h1 className="bold">{title}</h1>
        </header>
    )
}