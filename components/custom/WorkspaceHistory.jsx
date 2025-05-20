"use client";
import React, { use, useContext, useEffect, useState } from "react";
import { UserDetailContext } from "./context/UserDetailContext";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useSidebar } from "../ui/sidebar";

function WorkspaceHistory() {
    const {userDetail, setUserDetail} = useContext(UserDetailContext);
    const convex = useConvex();
    const [workspaceList, setWorkspaceList] = useState();
    const {toggleSidebar} = useSidebar();

    useEffect(()=>{
        userDetail&&GetAllWorkspaces();
    },[userDetail])

    const GetAllWorkspaces = async() => {
        const result = await convex.query(api.workspace.GetAllWorkspaces,{
            user: userDetail?._id
        });
        setWorkspaceList(result);
        console.log(result);
    }
    return (
        <div>
            
            <div>
                {workspaceList&&workspaceList?.map((workspace, index) => (
                    <Link href={'/workspace/'+workspace?._id} key={index} className="flex items-center gap-2 mt-4 p-2 rounded-md hover:bg-gray-800 transition-all duration-200 ease-in-out">
                    <h2 onClick={toggleSidebar} key={index} className="text-sm text-gray-400 font-light 
                    cursor-pointer hover:text-white transition-all duration-200 ease-in-out">
                        {workspace?.messages[0]?.content}
                    </h2>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default WorkspaceHistory;