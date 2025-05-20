"use client";
import React, { useContext, useEffect, useState, useRef } from "react";
import {
    SandpackProvider,
    SandpackLayout,
    SandpackCodeEditor,
    SandpackPreview,
    SandpackFileExplorer,
    useSandpack
} from "@codesandbox/sandpack-react";
import axios from "axios";
import { MessagesContext } from "./context/MessagesContext";
import Prompt from "@/app/data/Prompt";
import Lookup from "@/app/data/Lookup";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Loader2Icon, Code2 } from "lucide-react";

// Single file editor component that handles its own typing animation
const TypewriterEditor = ({ path, finalCode }) => {
    const [currentText, setCurrentText] = useState("");
    const [isComplete, setIsComplete] = useState(false);
    const { sandpack } = useSandpack();
    const charIndexRef = useRef(0);
    const timerRef = useRef(null);
    
    // Signal parent when complete
    const { onFileComplete } = useContext(StreamingContext);
    
    useEffect(() => {
        // Reset when a new file is provided
        setCurrentText("");
        charIndexRef.current = 0;
        setIsComplete(false);
        
        if (!finalCode) return;
        
        // Start the typing animation
        const typeNextChar = () => {
            if (charIndexRef.current < finalCode.length) {
                setCurrentText(prev => prev + finalCode[charIndexRef.current]);
                charIndexRef.current++;
                
                // Dynamically adjust typing speed
                const typingSpeed = 1
                timerRef.current = setTimeout(typeNextChar, typingSpeed);
            } else {
                setIsComplete(true);
                onFileComplete && onFileComplete(path);
            }
        };
        
        // Start typing
        typeNextChar();
        
        // Clean up
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [path, finalCode, onFileComplete]);
    
    // Update file content in Sandpack
    useEffect(() => {
        if (currentText && sandpack) {
            sandpack.updateFile(path, currentText);
        }
    }, [currentText, path, sandpack]);
    
    return null; // No UI, just logic
};

// Create a context to share streaming state
const StreamingContext = React.createContext(null);

function CodeView() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("code");
    const [files, setFiles] = useState(Lookup?.DEFAULT_FILE);
    const { messages, setMessages } = useContext(MessagesContext);
    const UpdateFiles = useMutation(api.workspace.UpdateFiles);
    const convex = useConvex();
    const [loading, setLoading] = useState(false);
    
    // Streaming-related states
    const [streamingInProgress, setStreamingInProgress] = useState(false);
    const [streamingQueue, setStreamingQueue] = useState([]);
    const [currentStreamingFile, setCurrentStreamingFile] = useState(null);
    const [completedFiles, setCompletedFiles] = useState([]);
    const [streamProgress, setStreamProgress] = useState(0);
    const [fileContents, setFileContents] = useState({});
    
    // Reference to original response from AI
    const aiResponseRef = useRef(null);
    
    useEffect(() => {
        id && GetFiles();
    }, [id]);

    const GetFiles = async () => {
        setLoading(true);
        const result = await convex.query(api.workspace.GetWorkspace, {
            workspaceId: id
        });
        const mergedFiles = { ...Lookup.DEFAULT_FILE, ...(result?.fileData || {}) };
        setFiles(mergedFiles);
        setLoading(false);
    };

    useEffect(() => {
        if (messages?.length > 0) {
            const role = messages[messages?.length - 1].role;
            if (role == 'user') {
                GenerateAiCode();
            }
        }
    }, [messages]);

    // Handle file switching when current file is completed
    const handleFileComplete = (completedPath) => {
        console.log(`File complete: ${completedPath}`);
        
        // Add to completed files
        setCompletedFiles(prev => [...prev, completedPath]);
        
        // Update progress
        const totalFiles = streamingQueue.length;
        const completedCount = completedFiles.length + 1; // Include the one just completed
        setStreamProgress(Math.floor((completedCount / totalFiles) * 100));
        
        // Move to next file in queue
        const newQueue = [...streamingQueue];
        newQueue.shift(); // Remove completed file
        
        if (newQueue.length > 0) {
            // Wait a moment before starting the next file (reduces flickering)
            setTimeout(() => {
                setCurrentStreamingFile(newQueue[0]);
                setStreamingQueue(newQueue);
            }, 500); // Half second delay between files
        } else {
            // All files completed
            finishStreaming();
        }
    };
    
    const GenerateAiCode = async () => {
        setLoading(true);
        const PROMPT = messages[messages?.length - 1]?.content + " " + Prompt.CODE_GEN_PROMPT;
        
        try {
            const result = await axios.post('/api/gen-ai-code', {
                prompt: PROMPT
            });
            
            console.log(result.data);
            const aiResp = result.data;
            aiResponseRef.current = aiResp;
            
            // Prepare files for streaming
            prepareStreaming(aiResp);
            
            setLoading(false);
        } catch (error) {
            console.error("Error generating code:", error);
            setLoading(false);
        }
    };

    const prepareStreaming = (aiResp) => {
        const filesToStream = aiResp?.files || {};
        const fileEntries = Object.entries(filesToStream);
        
        if (fileEntries.length === 0) {
            return;
        }
        
        // Create empty placeholders for all files
        const initialFiles = {};
        const fileContentsMap = {};
        const fileQueue = [];
        
        fileEntries.forEach(([path, fileData]) => {
            initialFiles[path] = { code: "" };
            fileContentsMap[path] = fileData.code;
            fileQueue.push(path);
        });
        
        // Update files state with empty placeholders
        setFiles(prev => ({
            ...prev,
            ...initialFiles
        }));
        
        // Set up the streaming queue
        setFileContents(fileContentsMap);
        setStreamingQueue(fileQueue);
        setCurrentStreamingFile(fileQueue[0]);
        setCompletedFiles([]);
        setStreamProgress(0);
        setStreamingInProgress(true);
    };

    const finishStreaming = () => {
        // Final update with the complete code
        setFiles(prev => {
            const updatedFiles = { ...prev };
            
            // Update all streamed files with their final content
            Object.entries(fileContents).forEach(([path, code]) => {
                updatedFiles[path] = { code };
            });
            
            return updatedFiles;
        });
        
        // Reset streaming states
        setStreamingInProgress(false);
        setCurrentStreamingFile(null);
        
        // Save to database
        UpdateFiles({
            workspaceId: id,
            files: aiResponseRef.current?.files || {}
        });
    };

    // Component to control file selection in SandpackCodeEditor
    const FileController = () => {
        const { sandpack } = useSandpack();
        
        useEffect(() => {
            if (currentStreamingFile && sandpack) {
                sandpack.setActiveFile(currentStreamingFile);
            }
        }, [currentStreamingFile, sandpack]);
        
        return null;
    };

    return (
        <div className="relative">
            <div className="bg-[#181818] w-full p-2 border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center flex-wrap shrink-0 bg-black p-1 justify-center rounded-full w-[140px] gap-3">
                        <h2 
                            onClick={() => setActiveTab("code")}
                            className={`text-sm cursor-pointer
                            ${activeTab=='code'&&'text-gray-900 bg-blue-500 bg-opacity-25 p-1 px-2 rounded-full'}`}>Code</h2>
                        <h2
                            onClick={() => setActiveTab("preview")}
                            className={`text-sm cursor-pointer 
                            ${activeTab=='preview'&&'text-gray-900 bg-blue-500 bg-opacity-25 p-1 px-2 rounded-full'}`}>Preview</h2>
                    </div>
                    {streamingInProgress && (
                        <div className="flex items-center gap-2">
                            <Code2 className="h-4 w-4 animate-pulse text-green-400" />
                            <div className="w-64 bg-gray-700 rounded-full h-2">
                                <div 
                                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${streamProgress}%` }}
                                ></div>
                            </div>
                            <span className="text-xs text-gray-300">
                                {completedFiles.length} / {streamingQueue.length + completedFiles.length} files
                            </span>
                        </div>
                    )}
                </div>
            </div>
            
            <StreamingContext.Provider value={{ 
                onFileComplete: handleFileComplete
            }}>
                <SandpackProvider
                    files={files}
                    template="react"
                    theme={"dark"}
                    customSetup={{
                        dependencies:{
                            ...Lookup.DEPENDANCY
                        }
                    }}
                    options={{
                        externalResources:['https://cdn.tailwindcss.com']
                    }}>
                    <SandpackLayout>
                        {activeTab=='code' ? <>
                            <SandpackFileExplorer style={{ height: '80vh' }} />
                            <SandpackCodeEditor style={{ height: '80vh' }} />
                            <FileController />
                            {streamingInProgress && currentStreamingFile && (
                                <TypewriterEditor 
                                    path={currentStreamingFile} 
                                    finalCode={fileContents[currentStreamingFile]} 
                                />
                            )}
                        </> : <>
                            <SandpackPreview style={{ height: '80vh' }} showNavigator={true} />
                        </>}
                    </SandpackLayout>
                </SandpackProvider>
            </StreamingContext.Provider>

            {loading && <div className="p-10 bg-gray-900 opacity-75
            absolute top-0 rounded-lg w-full h-full flex items-center justify-center">
                <Loader2Icon className="animate-spin h-10 w-10 text-white"/>
                <h2 className="text-white">Generating your files...</h2>
            </div>}
        </div>
    );
}

export default CodeView;