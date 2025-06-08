import React from 'react'
import { TfiFaceSad } from "react-icons/tfi";

const NoDta = () => {
  return (
    <div>
        <TfiFaceSad size={100} className="text-gray-400 mx-auto justify-between p-4 "/>
        <h2 className='text-center text-gray-400 font-semibold'>No Data Found</h2>
        
    </div>
  )
}

export default NoDta