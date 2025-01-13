import { useEffect, useState } from 'react';
import Logo from './components/Logo';
import Panther from './components/Panther';
import Prompt from './components/Prompt';
import Sidebar from './components/Sidebar';


function App() {
  const [promptCount, setPromptCount] = useState(1);
  const [prompts, setPrompts] = useState([]);
  const [nextId, setNextId] = useState(null);

  useEffect(()=>{
    if(promptCount < 1){
      setPromptCount(1)
    }
    if(promptCount > 10){
      setPromptCount(10)
    }
  },[promptCount])

  useEffect(() => {
    setPrompts([{
      promptId: 0,
      commands: [],
      isExpanded: false,
    }]);
    setNextId(1);
  }, []);

  const addPrompt = () => {
    const newPrompt = {
      promptId: nextId,
      commands: [],
      isExpanded: false,
    };
    setPrompts((prev) => [...prev, newPrompt]);
    setNextId((prev) => prev + 1);
    setPromptCount((prev)=>prev+1)
  };

  const deletePrompt = (id) => {
    setPrompts((prev) => prev.filter((prompt) => prompt.promptId !== id));
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

  console.log(prompts)

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
        <Panther />
        
        <div className={`w-8/12 grid ${promptCount === 1 ? 'h-[75vh] grid-cols-1': 'h-[83vh] grid-cols-2'} gap-3 
          ${(promptCount > 4) && 'overflow-auto custom-scrollbar '}`}>
          {prompts.map((prompt, index)=>(
            <Prompt key={index} prompt={prompt} promptCount={promptCount} deletePrompt={deletePrompt} 
              toggleExpand={toggleExpand} updatePromptCommands={updatePromptCommands}/>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
