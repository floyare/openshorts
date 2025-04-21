import { Compass } from "lucide-react";
import Logo from "./logo";

const Navbar = () => {
    return (
        <nav className="w-full flex items-center justify-center p-4">
            <div className="flex flex-col gap-4">
                <Logo />
                <div className="flex items-center justify-center gap-4 p-3">
                    <a href="#" className="flex flex-col items-center cursor-pointer text-xl hover:text-text-500 transition-colors"><Compass size={32} /> Browse</a>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;