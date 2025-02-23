import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom';

const ContactUs = () => {

  const navigate = useNavigate();

  return (
    <div className='flex items-center justify-center min-h-screen px-6 bg-red-400 sm:px-0 bg-[url("/bg_img.png")] bg-cover bg-center'>

      <img src={assets.logo} className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' onClick={() => navigate('/')} />

      <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
        <h2 className='text-3xl font-semibold text-white text-center mb-4'>
          Contact Us
        </h2>

        <form>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-lg bg-[#333A5C]'>
            <img src={assets.mail_icon} alt="" />
            <input className='bg-transparent outline-none' type="email" placeholder='Email' required />
          </div>

          <div className='mb-4 h-20 flex items-start gap-3 w-full px-5 py-2.5 rounded-lg bg-[#333A5C]'>
            <textarea name="comment" placeholder='Add your comments here' className='w-full outline-0 resize-none'>
            </textarea>
          </div>

          <button className='mb-4 w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium hover:cursor-pointer'>
            Send query
          </button>
        </form>

        <p className='text-center text-sm'>
            Assistance will be provided for you shortly.
        </p>

      </div>

    </div>
  )
}

export default ContactUs
