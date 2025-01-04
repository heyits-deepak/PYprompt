import { useEffect, useState } from 'react';
import Logo from './components/Logo';
import Panther from './components/Panther';
import Prompt from './components/Prompt';
import Sidebar from './components/Sidebar';


function App() {
  const [promptCount, setPromptCount] = useState(1);
  const [prompts, setPrompts] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(()=>{
    if(promptCount < 1){
      setPromptCount(1)
    }
    if(promptCount > 10){
      setPromptCount(10)
    }
    setPrompts(Array.from({ length: promptCount }, (_, index) => index))
  },[promptCount])

  const deletePrompt = (index) => {
    setPrompts((prevPrompts) => {
      const updatedPrompts = prevPrompts.filter((_, i) => i !== index);
      setPromptCount(updatedPrompts.length); // Adjust the prompt count
      return updatedPrompts;
    });
  };

  return (
    <div className="App">
      <Logo />
      <Sidebar setPromptCount={setPromptCount}/> {/* Optional , remove it if you don't want menu */}
      <div className='w-screen h-screen flex items-center justify-end relative pr-8'>
        <Panther />
        
        <div className={`w-8/12 grid ${promptCount === 1 ? 'h-[75vh] grid-cols-1': 'h-[85vh] grid-cols-2'} gap-5 
          ${(promptCount > 4) && 'overflow-auto custom-scrollbar'}`}>
          {prompts.map((_, index)=>(
            <Prompt key={index} i={index} promptCount={promptCount} deletePrompt={deletePrompt} isExpanded={expandedIndex === index}
            setExpandedIndex={setExpandedIndex}/>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
