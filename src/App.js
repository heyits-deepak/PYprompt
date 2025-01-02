import Logo from './components/Logo';
import Panther from './components/Panther';
import Prompt from './components/Prompt';
import Sidebar from './components/Sidebar';


function App() {
  return (
    <div className="App">
      <Logo />
      <Sidebar /> {/* Optional , remove it if you don't want menu */}
      <div className='w-screen h-screen flex items-center justify-end relative pr-8'>
        <Panther />
        <Prompt />
      </div>
    </div>
  );
}

export default App;
