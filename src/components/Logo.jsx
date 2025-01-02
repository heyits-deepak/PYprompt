import React from 'react'

const Logo = () => {
  return (
    <div className='absolute top-0 left-0 z-10 text-[#2dc90a] p-2 cursor-default'>
        <p className='text-5xl text-center prompt-head'><span className='text-orange-400'>Paw</span>Shell</p>

        <p className='text-xs text-center italic'>~~ Developed by 
            <a href='https://www.linkedin.com/in/deepak-sharma-4b2032240/' target='_blank' className='cursor-pointer'>{` Deepak Sharma `}
            </a>~~</p>
    </div>
  )
}

export default Logo