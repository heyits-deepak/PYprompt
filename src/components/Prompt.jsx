import React, { useEffect, useRef, useState } from 'react'
import { IoMdContract, IoMdExpand } from "react-icons/io";
import { MdOutlineDeleteForever } from "react-icons/md";

const Prompt = ({prompt, promptCount, deletePrompt, toggleExpand, updatePromptCommands}) => {
    const [startPrompt, setStartPrompt] = useState('')
    const [cmdByUser, setCmdByUser] = useState('')
    const [commands, setCommands] = useState(prompt.commands || []);
    const [commandIndex, setCommandIndex] = useState(null);
    const [fontSize, setFontSize] = useState(15);

    const containerRef = useRef(null);

    useEffect(() => {
        // Clear commands if the prompt is deleted
        if (!prompt) {
          setCommands([]);
        }
      }, [prompt]);

      useEffect(() => {
        setTimeout(() => setStartPrompt(`Madpacker\\root>`), 800)
     }, [])
 
     useEffect(() => {
         window.addEventListener("keydown", handleKeyDown);
         return () => {
             window.removeEventListener("keydown", handleKeyDown);
         };
     }, [commands, cmdByUser, commandIndex]);
 
     useEffect(() => {
         if (containerRef.current) {
             containerRef.current.scrollTop = containerRef.current.scrollHeight;
         }
     }, [commands]);

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
                    const newCommand = {
                            startPrompt,
                            command,
                            response: data.response,
                        }

                    // Update local commands state
                    setCommands((prev) => {
                        const updatedCommands = [...prev, newCommand];
                        updatePromptCommands(prompt.promptId, updatedCommands); // Update prompt.commands in parent
                        return updatedCommands;
                    });
                }
                // if (data.pwd) {
                //     console.log(data.pwd)
                //     setStartPrompt(`Madpacker\\${data.pwd}>`);
                // }
    
            } else {
                const newCommand = {
                            startPrompt,
                            command,
                            response: `Error: ${data.error || 'Unknown error occurred'}`,
                        }

                    // Update local commands state
                    setCommands((prev) => {
                        const updatedCommands = [...prev, newCommand];
                        updatePromptCommands(prompt.promptId, updatedCommands); // Update prompt.commands in parent
                        return updatedCommands;
                    });

            }
        } catch (error) {
            const errorCommand = {
                startPrompt,
                command,
                response: 'Connection error: Could not reach the server',
              };
        
              setCommands((prev) => {
                const updatedCommands = [...prev, errorCommand];
                updatePromptCommands(prompt.promptId, updatedCommands); // Update prompt.commands in parent
                return updatedCommands;
              });
        }
    };      

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
            <div className={`${prompt.isExpanded ? 'absolute top-0 left-0 h-[99.5vh] w-screen z-50': `w-[100%] ${promptCount === 1 ? 'h-[76vh]': 'h-[40vh]'}`} bg-black 
              rounded-md shadow-xl shadow-gray-950 border border-gray-800`}>
                <div className='flex justify-between items-center p-2 pb-3'>
                    <div className='flex gap-2'>
                        <div className='w-[12px] h-[12px] bg-red-700 rounded-full'></div>
                        <div className='w-[12px] h-[12px] bg-yellow-600 rounded-full'></div>
                        <div className='w-[12px] h-[12px] bg-green-700 rounded-full'></div>
                    </div>

                    <div className='flex'>
                        {prompt.isExpanded ? 
                            <IoMdContract className='text-gray-600 cursor-pointer text-xl' onClick={()=>toggleExpand(prompt.promptId)}/>
                            : <IoMdExpand className='text-gray-600 cursor-pointer text-xl' onClick={()=>toggleExpand(prompt.promptId)}/>
                        }
                        {promptCount !==1 && !prompt.isExpanded && 
                            <MdOutlineDeleteForever className='text-red-900 cursor-pointer text-xl'
                            onClick={()=>deletePrompt(prompt.promptId)}/>}
                    </div>
                </div>

                <div className={`w-full ${promptCount === 1 ? 'h-[90%]': 'h-[85%]'} overflow-auto text-[#2dc90a] p-2 mb-2 custom-scrollbar`} ref={containerRef}>
                  {promptCount===1 && (<>
                    <p className='text-7xl text-center prompt-head mt-2'><span className='text-orange-400'>Paw</span>Shell</p>
                    <p className='text-center italic'>"Unleash the power of the command line."</p>
                    <p className='text-xs text-center mb-8 italic'>~~ Developed by Deepak Sharma ~~</p>
                  </>)}
             
                    <div className='h-auto w-full prompt-text text-xs space-y-4' style={{ fontSize: `${fontSize}px` }}>
                        {commands.map((cmd, index) => (
                            <div key={index} className="space-y-1">
                                <div className="flex items-center">
                                    <span>{cmd.startPrompt}</span>
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