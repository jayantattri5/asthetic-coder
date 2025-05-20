"use client";
import react, { useContext, useState } from "react";
import { ArrowRight, User } from "lucide-react";
import { Link } from "lucide-react";
import Lookup from "@/app/data/Lookup";
import Colors from "@/app/data/Colors";
import { MessagesContext } from "./context/MessagesContext";
import SignInDialog from "./SigninDialog";
import { UserDetailContext } from "./context/UserDetailContext";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import LetterGlitch from "./LetterGlitch";

function Hero() {
    const [userInput, setUserInput] = useState();
    const {messages, setMessages} = useContext(MessagesContext);
    const {userDetail, setUserDetail} = useContext(UserDetailContext);
    const [openDialog, setOpenDialog] = useState(false);
    const CreateWorkspace = useMutation(api.workspace.CreateWorkspace);
    const router = useRouter();
    const onGenerate = async (input) => {
        if (!userDetail?.name) {
            setOpenDialog(true);
            return;
        }
        const msg = {
            role: "user",
            content: input
        }
        setMessages(msg);
        
        const workspaceId = await CreateWorkspace({
            user: userDetail?._id,
            messages: [msg]
        });
        console.log(workspaceId);
        router.push('/workspace/'+workspaceId);
    };
    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* LetterGlitch as background - fixed position to cover entire viewport */}
            <div className="fixed inset-0 w-100px h-full">
                <LetterGlitch />
            </div>
            
            {/* Content overlay centered on the page */}
            <div className="fixed inset-0 flex flex-col items-center justify-center z-10">
                {/* Semi-transparent backdrop for better readability */}
                <div className="flex flex-col items-center gap-0 w-full px-10 py-1 max-w-3xl mx-auto rounded-4xl" style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    boxShadow: '0 0 40px 20px rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(3px)'
                }}>
                    <h2 className="font-bold text-4xl text-white drop-shadow-lg" style={{
                        textShadow: '0 0 10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.6)'
                    }}>What do You want to Build?</h2>
                    
                    <p className="text-gray-300 font-medium drop-shadow-lg mb-4" style={{
                        textShadow: '0 0 10px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 0, 0, 0.6)'
                    }}>Prompt, Run, Edit and Deploy full-stack web apps.</p>
                    
                    <div className="p-5 border rounded-xl w-full mt-2"
                    style={{
                        backgroundColor: Colors.BACKGROUND,
                        boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div className="flex gap-2">
                            <textarea 
                                placeholder="What do you want to build?"
                                onChange={(event)=>setUserInput(event.target.value)}
                                className="outline-none bg-transparent w-full h-32 max-h-56 resize-none"
                            />
                            {userInput && 
                                <ArrowRight
                                    onClick={() => onGenerate(userInput)}
                                    className="bg-blue-500 p-2 h-10 w-10 rounded-md cursor-pointer" 
                                />
                            }
                        </div>
                        <div>
                            <Link/>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                        {Lookup?.SUGGESTIONS.map((suggestion, index) => (
                            <h2 key={index}
                            onClick={() => onGenerate(suggestion)}
                            className="p-1 px-3 border rounded-full text-sm text-white hover:text-white cursor-pointer hover:bg-blue-800 transition-colors"
                            style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
                                textShadow: '0 0 5px rgba(0, 0, 0, 0.9)'
                            }}
                            >{suggestion}</h2>
                        ))}
                    </div>
                </div>
            </div>
            
            <SignInDialog openDialog={openDialog} closeDialog={(v)=>setOpenDialog(v)}/>
        </div>
    )
}

export default Hero;