"use client";
import { api } from "@/convex/_generated/api";
import { useConvex, useMutation } from "convex/react";
import { useParams } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import { MessagesContext } from "./context/MessagesContext";
import Colors from "@/app/data/Colors";
import { UserDetailContext } from "./context/UserDetailContext";
import Image from "next/image";
import { ArrowRight, Link, Loader2Icon } from "lucide-react";
import axios from "axios";
import Prompt from "@/app/data/Prompt";
import ReactMarkdown from "react-markdown";
import { useSidebar } from "../ui/sidebar";

function ChatView() {
    const { id } = useParams();
    const convex = useConvex();
    const { userDetail, setUserDetail } = useContext(UserDetailContext);
    const { messages, setMessages } = useContext(MessagesContext);
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);
    const UpdateMessages = useMutation(api.workspace.UpdateWorkspace);
    const bottomRef = useRef(null);
    const [partialResponse, setPartialResponse] = useState(""); // new state for streaming
    const {toggleSidebar} = useSidebar();

    useEffect(() => {
        const fetchWorkspaceData = async () => {
            if (!id) return;
            const result = await convex.query(api.workspace.GetWorkspace, {
                workspaceId: id,
            });
            setMessages(result?.messages || []);
            console.log(result);
        };

        fetchWorkspaceData();
    }, [id, convex, setMessages]);

    useEffect(() => {
        if (messages && messages.length > 0) {
            const role = messages[messages.length - 1].role;
            if (role === 'user') {
                GetAiResponse()
            }
        }
    }, [messages])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, partialResponse]);    

    const GetAiResponse = async () => {
        setLoading(true);
        const PROMPT = JSON.stringify(messages) + Prompt.CHAT_PROMPT;
    
        const result = await axios.post("/api/ai-chat", {
            prompt: PROMPT,
        });
    
        const fullContent = result.data.result;
        let currentIndex = 0;
        setPartialResponse("");
    
        const interval = setInterval(() => {
            if (currentIndex < fullContent.length) {
                setPartialResponse(prev => prev + fullContent[currentIndex]);
                currentIndex++;
            } else {
                clearInterval(interval);
    
                const aiResp = {
                    role: 'ai',
                    content: fullContent
                };
                const updatedMessages = [...(messages || []), aiResp];
                setMessages(updatedMessages);
                setPartialResponse(""); // Clear once added
                UpdateMessages({
                    messages: updatedMessages,
                    workspaceId: id,
                });
                setLoading(false);
            }
        }, 5); // Adjust speed here
    };    

    const onGenerate = async (input) => {
        const newUserMessage = {
            role: "user",
            content: input
        };
        const updatedMessages = [...(messages || []), newUserMessage];
        setMessages(updatedMessages);
        setUserInput("");
    }

    return (
        <div className="relative h-[85vh] flex flex-col">
            <div className="flex-1 overflow-y-scroll scrollbar-hide p-5">
                {Array.isArray(messages) && messages.map((msg, index) => (
                    <div key={index}
                        className="p-3 rounded-lg mb-2 flex gap-2 items-start leading-7"
                        style={{
                            backgroundColor: Colors.CHAT_BACKGROUND
                        }}>
                        {msg?.role === 'user' && (
                            <Image
                                src={userDetail?.picture || "https://cdn3.iconfinder.com/data/icons/essential-rounded/64/Rounded-31-512.png"}
                                alt="User"
                                width={35}
                                height={35}
                                className="rounded-full mr-2"
                            />
                        )}
                        <div className="flex flex-col">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}
                {loading && <div className="p-3 rounded-lg mb-2 flex gap-2 items-start">
                    <Loader2Icon className="animate-spin" />
                    <h2>Generating response...</h2>
                </div>}
                {/* Streaming AI response */}
                {partialResponse && (
                    <div className="p-3 rounded-lg mb-2 flex gap-2 items-start leading-7"
                        style={{ backgroundColor: Colors.CHAT_BACKGROUND }}>
                        <div className="flex flex-col">
                            <ReactMarkdown>{partialResponse}</ReactMarkdown>
                        </div>
                    </div>
                )}

                {/* This dummy div will always scroll into view */}
                <div ref={bottomRef}></div>
            </div>

            {/* Input Section */}
            <div className="flex gap-2 items-end">
                <Image
                    src={userDetail?.picture || "https://cdn3.iconfinder.com/data/icons/essential-rounded/64/Rounded-31-512.png"}
                    alt="User"
                    width={35}
                    height={35}
                    className="rounded-full mr-2 cursor-pointer"
                    onClick={toggleSidebar}
                />
                <div className="p-5 border rounded-xl w-full mt-2"
                    style={{
                        backgroundColor: Colors.BACKGROUND,
                        boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)'
                    }}>
                    <div className="flex gap-2">
                        <textarea
                            placeholder="What do you want to build?"
                            value={userInput}
                            onChange={(event) => setUserInput(event.target.value)}
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
                        <Link />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatView;