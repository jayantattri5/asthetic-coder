import { HelpCircle, LogOut, Settings, Wallet } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

function SideBarFooter() {
    const options = [
        { name: "Settings", icon: Settings },
        { name: "Help Center", icon: HelpCircle },
        { name: "My subscription", icon: Wallet },
        { name: "Logout", icon: LogOut },
    ]
    return (
    <div>
        {options.map((option, index) => (
            <Button variant="ghost" className="flex items-center gap-2 mt-4 p-2 rounded-md hover:bg-gray-800 transition-all duration-200 ease-in-out" key={index}>
                <option.icon className="h-4 w-4 mr-2" />
                {option.name}
            </Button>
        ))}
    </div>
    )
}

export default SideBarFooter;