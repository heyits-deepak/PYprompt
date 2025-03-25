import React from 'react'
import { IoAdd } from "react-icons/io5"
import { IoLogoGithub } from "react-icons/io"
import { FaLinkedin } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";

const Sidebar = ({addPrompt}) => {
  return (
    <div className=' h-auto px-2 py-5 bg-black mx-1 z-10 absolute top-56 left-0 border border-gray-800 
      rounded-md shadow-xl shadow-gray-950 flex flex-col items-center justify-center gap-8'>

      <IoAdd className='text-gray-600 text-3xl cursor-pointer hover:text-[#2dc90a] hover:scale-110 transition-all duration-300 
        ease-in-out' onClick={addPrompt}/>

      <a href="https://github.com/heyits-deepak" target='_blank' rel="noreferrer">
        <IoLogoGithub className='text-gray-600 text-2xl cursor-pointer hover:text-[#2dc90a] hover:scale-110 transition-all duration-300 ease-in-out'/>
      </a>
      <a href='https://www.linkedin.com/in/deepak-sharma-4b2032240/' target='_blank' rel="noreferrer">
        <FaLinkedin className='text-gray-600 text-2xl cursor-pointer hover:text-[#2dc90a] hover:scale-110 transition-all duration-300 ease-in-out'/>
      </a>

      <a href="https://www.instagram.com/sharma_thepak?igsh=MWhzbXB6d3pvNnI0dg==" target='_blank' rel="noreferrer">
        <FaInstagram className='text-gray-600 text-2xl cursor-pointer hover:text-[#2dc90a] hover:scale-110 transition-all duration-300 ease-in-out'/>
      </a>
    </div>
  )
}

export default Sidebar