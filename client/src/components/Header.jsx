import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'

const Header = () => {

  const {userData} = useContext(AppContext)

  return (
    <div className='flex flex-col items-center mt-20 px-4 text-center text-gray-800'>

      <img src={assets.header_img} className='w-36 h-36 rounded-full mb-6 animate-bounce' draggable='false' />

      <h1 className='flex itmes-center gap-2 text-xl sm:text-3xl font-medium mb-2'>
        Hey {userData ? userData.name : 'Developer'} !
        <img src={assets.hand_wave} className='w-8 aspect-square' draggable='false'/>
      </h1>

      <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>Welcome to our app</h2>

      <p className='mb-8 max-w-md'>Website is under construction. <br></br>
      You should wait until the development is complete and the website is "deployed" to access it fully.
      </p>

      <button className='border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transition-all hover:cursor-pointer'>Get started</button>

    </div>
  )
}

export default Header
