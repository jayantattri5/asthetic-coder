import React from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
  } from "@/components/ui/sidebar"
import { Button } from "../ui/button";
import { MessageCircleCode } from "lucide-react";
import WorkspaceHistory from "./WorkspaceHistory";
import SideBarFooter from "./SideBarFooter";

function AppSideBar() {
    return (
        <Sidebar>
      <SidebarHeader className="p-5">
        <Button><MessageCircleCode/> Start New Chat </Button>
        <h2 className="font-medium text-lg py-5">Your Chats</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
            <WorkspaceHistory/>
        </SidebarGroup>
        {/* <SidebarGroup /> */}
      </SidebarContent>
      <SidebarFooter >
        <SideBarFooter/>
      </SidebarFooter>
    </Sidebar>
    )
}

export default AppSideBar;