import React from 'react'
import tigerVid from '../tigerVid.gif'
import tigerImg from '../tigerImg.png'

const Panther = () => {
  return (
    <div className='h-[75vh] z-0 flex flex-col justify-end'>
      {/* Use either of the below images options , 1st is for still image and 2nd is for gif image  */}
      
      {/* <img alt='PawShell' width={100} height={200} src={tigerImg} className='tiger'/> */}
      <img alt='PawShell' width={100} height={200} src={tigerVid} className='tiger'/>
    </div>
  )
}

export default Panther