import React, { useEffect, useRef, useState } from 'react'
import { IoMdContract, IoMdExpand } from "react-icons/io";

const Prompt = () => {
    const [startPrompt, setStartPrompt] = useState('')
    const [cmdByUser, setCmdByUser] = useState('')
    const [commands, setCommands] = useState([]);
    const [commandIndex, setCommandIndex] = useState(null);
    const [fontSize, setFontSize] = useState(15);
    const [expandPrompt, setExpandPrompt] = useState(false);

    const containerRef = useRef(null);

    const executeCommand = async (command) => {
        try {
            const response = await fetch('http://localhost:8000/process-prompt/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ command }),
            });
            
            const data = await response.json();
            
            if (data.success !== false) {
                if (data.response === 'CLEAR_TERMINAL') {
                    setCommands([]);
                } else {
                    setCommands(prev => [...prev, {
                        command: command,
                        response: data.response
                    }]);
                }
            } else {
                setCommands(prev => [...prev, {
                    command: command,
                    response: `Error: ${data.error || 'Unknown error occurred'}`
                }]);
            }
        } catch (error) {
            setCommands(prev => [...prev, {
                command: command,
                response: 'Connection error: Could not reach the server'
            }]);
        }
    };

    useEffect(() => {
        setTimeout(() => setStartPrompt(`Madpacker\\root>`), 1000)
    }, [])

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [commands, cmdByUser, commandIndex]);

    const handleKeyDown = (event) => {
        if (event.ctrlKey && (event.key === "+" || event.key === "=")) {
            event.preventDefault();
            setFontSize((prev) => Math.min(prev + 1, 32));
        } else if (event.ctrlKey && event.key === "-") {
            event.preventDefault();
            setFontSize((prev) => Math.max(prev - 1, 10));
        }

        if (event.key === "Enter" && cmdByUser.trim() !== "") {
            executeCommand(cmdByUser);
            setCmdByUser("");
            setCommandIndex(null);

            setTimeout(() => {
                if (containerRef.current) {
                    containerRef.current.scrollTop = containerRef.current.scrollHeight;
                }
            }, 0);
        } else if (event.key === "ArrowUp") {
            if (commandIndex === null && commands.length > 0) {
                setCommandIndex(commands.length - 1);
                setCmdByUser(typeof commands[commands.length - 1] === 'string' 
                    ? commands[commands.length - 1] 
                    : commands[commands.length - 1].command);
            } else if (commandIndex !== null && commandIndex > 0) {
                setCommandIndex(commandIndex - 1);
                setCmdByUser(typeof commands[commandIndex - 1] === 'string' 
                    ? commands[commandIndex - 1] 
                    : commands[commandIndex - 1].command);
            }
        } else if (event.key === "ArrowDown") {
            if (commandIndex !== null && commandIndex < commands.length - 1) {
                setCommandIndex(commandIndex + 1);
                setCmdByUser(typeof commands[commandIndex + 1] === 'string' 
                    ? commands[commandIndex + 1] 
                    : commands[commandIndex + 1].command);
            } else if (commandIndex !== null && commandIndex === commands.length - 1) {
                setCommandIndex(null);
                setCmdByUser("");
            }
        }
    };
      
    return (
        <>
            <div className={`${expandPrompt ? 'absolute top-0 left-0 h-[99.5vh] w-screen':'h-[75vh] w-8/12'} z-10 bg-black 
              rounded-md shadow-xl shadow-gray-950 border border-gray-800`}>
                <div className='flex justify-between items-center p-2 pb-3'>
                    <div className='flex gap-2'>
                        <div className='w-[15px] h-[15px] bg-red-700 rounded-full'></div>
                        <div className='w-[15px] h-[15px] bg-yellow-600 rounded-full'></div>
                        <div className='w-[15px] h-[15px] bg-green-700 rounded-full'></div>
                    </div>

                    {expandPrompt ? 
                        <IoMdContract className='text-gray-600 cursor-pointer text-2xl' onClick={()=>setExpandPrompt(false)}/>
                        : <IoMdExpand className='text-gray-600 cursor-pointer text-2xl' onClick={()=>setExpandPrompt(true)}/>
                    }
                </div>

                <div className='w-full h-[90%] overflow-auto text-[#2dc90a] p-2 mb-2 custom-scrollbar' ref={containerRef}>
                    <p className='text-7xl text-center prompt-head mt-2'><span className='text-orange-400'>Paw</span>Shell</p>
                    <p className='text-center italic'>"Unleash the power of the command line."</p>
                    <p className='text-xs text-center mb-8 italic'>~~ Developed by Deepak Sharma ~~</p>

                    <div className='h-auto w-full prompt-text text-xs space-y-2' style={{ fontSize: `${fontSize}px` }}>
                        {commands.map((cmd, index) => (
                            <div key={index} className="space-y-1">
                                <div className="flex items-center">
                                    <span>{`Madpacker\\root>`}</span>
                                    <span className="ml-1">{typeof cmd === 'string' ? cmd : cmd.command}</span>
                                </div>
                                {cmd.response && (
                                    <div className="ml-4 whitespace-pre-wrap font-mono">
                                        {cmd.response}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className='flex items-center'>
                            <span>{startPrompt}</span>
                            <input 
                                type="text" 
                                value={cmdByUser} 
                                onChange={(e)=>setCmdByUser(e.target.value)} 
                                onKeyDown={handleKeyDown}
                                className="bg-black prompt-text text-[#2dc90a] outline-none ml-1 w-full" 
                                autoFocus={true}
                                spellCheck="false"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Prompt;