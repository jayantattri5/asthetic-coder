import react, { useContext } from "react";
import { Button } from "../ui/button";
import { UserDetailContext } from "./context/UserDetailContext";

function Header() {
    const { userDetail, setUserDetail } = useContext(UserDetailContext);
    return (
        <div className="p-4 flex justify-between items-center">
        {!userDetail?.name  && <div className="flex gap-5">
                <Button variant="ghost">Sign In</Button>
                <Button>Get Started</Button>
            </div>}
        </div>
    )
}

export default Header;