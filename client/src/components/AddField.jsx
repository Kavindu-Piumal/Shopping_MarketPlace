import React from 'react'
import { IoClose } from 'react-icons/io5'

const AddField = ({close,value,onChange,submit}) => {
  return (
    <section className='fixed top-0 left-0 w-full h-full p-4 bg-black/50 z-50 flex items-center justify-center'>
      <div className='bg-white max-w-4xl w-full p-4 rounded'>
        <div className='flex items-center justify-between gap-3'>
          <h1 className='text-2xl font-bold text-left flex-1'>
            Add Field
          </h1>
          <button onClick={close} className='w-fit block ml-auto'>
            <IoClose/>
          </button>
        </div>
        <input
            className='bg-blue-100 p-2 rounded mt-3 w-full'
            placeholder='Field Name'
            value={value}
            onChange={onChange}

        />

        <button onClick={submit} className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mt-3 mx-auto block'>
            Add
        </button>

      </div>
    </section>
  )
}

export default AddField