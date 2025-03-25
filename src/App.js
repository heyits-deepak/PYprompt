import { useEffect, useState } from 'react';
import Logo from './components/Logo';
import Panther from './components/Panther';
import Prompt from './components/Prompt';
import Sidebar from './components/Sidebar';


function App() {
  const [promptCount, setPromptCount] = useState(1);
  const [prompts, setPrompts] = useState([{
    promptId: 0,
    commands: [],
    isExpanded: false,
    isActive: true
  }]);
  const [nextId, setNextId] = useState(1);

  // useEffect(()=>{
  //   if(promptCount < 1){
  //     setPromptCount(1)
  //   }
  //   if(promptCount > 2){
  //     setPromptCount(2)
  //   }
  // },[promptCount])

  const addPrompt = () => {
    if(promptCount > 5){
      return;
    }else{
      const newPrompt = {
        promptId: nextId,
        commands: [],
        isDeleted: false,
        isExpanded: false,
        isActive: false
      };
      
      setPrompts((prev) => [...prev, newPrompt]);
      setNextId((prev) => prev + 1);
      setPromptCount((prev)=>prev+1) 
    }
  };



  const deletePrompt = (id) => {
    setPrompts((prev) =>
      prev.map((prompt) =>
        prompt.promptId === id ? { ...prompt, isDeleted: true } : prompt
      )
    );
    setPromptCount((prev)=>prev-1)
  };

  const toggleExpand = (id) => {
    setPrompts((prev) =>
      prev.map((prompt) =>
        prompt.promptId === id
          ? { ...prompt, isExpanded: !prompt.isExpanded }
          : { ...prompt, isExpanded: false }
      )
    );
  };

  const handleInputFocus = (id) => {
    setPrompts((prev) =>
      prev.map((prompt) =>
        prompt.promptId === id
          ? { ...prompt, isActive: true }
          : { ...prompt, isActive: false }
      )
    );
  };

  const updatePromptCommands = (promptId, updatedCommands) => {
    setPrompts((prev) =>
      prev.map((p) =>
        p.promptId === promptId ? { ...p, commands: updatedCommands } : p
      )
    );
  };

  return (
    <div className="App">
      <Logo />
      <Sidebar addPrompt={addPrompt}/> {/* Optional , remove it if you don't want menu */}
      <div className='w-screen h-screen flex items-center justify-end relative pr-8'>
        {promptCount === 1 && <Panther />}
        
        <div className={`grid ${promptCount === 1 ? 'w-9/12 h-[75vh] grid-cols-1': `w-11/12 mt-8  
          ${promptCount === 2 ? 'h-[70vh] grid-cols-2': 'h-[80vh] grid-cols-3'}`} gap-3 
          ${(promptCount > 8) && 'overflow-auto custom-scrollbar '}`}>
          
          {prompts?.filter((item)=> !item.isDeleted)?.map((prompt, index)=>(
            <Prompt key={index} prompt={prompt} promptCount={promptCount} deletePrompt={deletePrompt} 
              toggleExpand={toggleExpand} handleInputFocus={handleInputFocus} updatePromptCommands={updatePromptCommands}/>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
