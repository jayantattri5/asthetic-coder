"use client";
import React, { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import Header from "@/components/custom/Header";
import { MessagesContext } from "@/components/custom/context/MessagesContext";
import { UserDetailContext, UserDetailProvider } from "@/components/custom/context/UserDetailContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSideBar from "@/components/custom/AppSideBar";

function Provider ({children}) {
  const [messages, setMessages] = useState();
  const [userDetail, setUserDetail] = useState();
  const convex = useConvex();

  useEffect(() => {
    IsAuthenticated();
  }
  ,[])

  const IsAuthenticated = async() => {
    if (typeof window !== undefined) 
    {
      const user = JSON.parse(localStorage.getItem("user"))
      //Fetch from Database
      const result = await convex.query(api.users.GetUser,{
        email: user?.email,
      })
      setUserDetail(result);
      console.log(result);
    }
  }
  return (
    <div>
      <GoogleOAuthProvider clientId="462719399058-cv9kon8kh5mv67p4dkrmbnr94nf37bs6.apps.googleusercontent.com">
      <UserDetailContext.Provider value={{userDetail, setUserDetail}}>
      <MessagesContext.Provider value={{messages, setMessages}}>
        <NextThemesProvider
          attribute ="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
          >
            <Header/>
            <SidebarProvider defaultOpen={false}>
              <AppSideBar />
      {children}
            </SidebarProvider>
        </NextThemesProvider>
      </MessagesContext.Provider>
      </UserDetailContext.Provider>
      </GoogleOAuthProvider>
    </div>
  )
}

export default Provider;