import React, { use, useState } from 'react'
import UploadCategory from '../components/uploadCategory'
import { useEffect } from 'react';
import Loading from '../components/Loading';
import NoDta from '../components/NoDta';
import Axios from '../utils/Axios';
import summaryApi from '../common/summaryApi';
import { useNotification } from '../context/NotificationContext';
import EditCategory from '../components/EditCategory';
import ConfirmBox from '../components/ConfirmBox';
import { useSelector, useDispatch } from 'react-redux';
import { setAllCategory } from '../Store/ProductSlice';
import DashboardMobileLayout from '../components/DashboardMobileLayout';





const Category = () => {
  const dispatch = useDispatch();
  const { showSuccess, axiosNotificationError } = useNotification();
  const [openUploadCategory, setOpenUploadCategory] = useState(false);
  const [loading,setLoading]=useState(false);
  const [categorieData, setCategorieData] = useState([]);
  const [openEdit,setOpenEdit]=useState(false);
  const [editData,setEditData] = useState({
    name: "",
    image: "",
  });
  const [openConfirmBoxDelete,setOpenConfirmBoxDelete] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState({
    id: "",
  })

  const allCategory=useSelector((state)=>state.product.allCategory);
  const user = useSelector((state) => state.user);
  //console.log("allCategory", allCategory);

  useEffect(()=>{
    setCategorieData(allCategory);

  },[allCategory])

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        url: summaryApi.getCategory.url,
        method: summaryApi.getCategory.method
      });
      const { data: responseData } = response;      if (responseData.success) {
        setCategorieData(responseData.data);
        dispatch(setAllCategory(responseData.data)); // Update Redux state so allCategory is always fresh
      }
    } catch (error) {
      axiosNotificationError(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, [])

  const handleDeleteCategoty = async()=>{
    try{
      const response=await Axios({
        url: summaryApi.deleteCategory.url,
        method: summaryApi.deleteCategory.method,
        data: deleteCategory
      })

      const { data:responseData } = response;      if(responseData.success){
        showSuccess(responseData.message)
        fetchCategories();
        setOpenConfirmBoxDelete(false)
      }

    }catch(error){
      axiosNotificationError(error)
    }
  }

  //console.log("categorieData", categorieData);

  
  return (
    <DashboardMobileLayout>
      <div className='bg-white'>
        <div className='p-2 font-semibold bg-white shadow-md flex items-center justify-between'>
          <h2>Category</h2>
          <button onClick={()=>setOpenUploadCategory(true)} className='text-sm border border-primary-200 hover:bg-green-300 px-3 py-1 rounded'>Add Category</button>
        </div>

      {
        !categorieData[0] && !loading && (
          <NoDta/>
          
        )
      }

      {
        loading && (
          <Loading/>
        )
      }

        

      <div className='p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 bg-gradient-to-br from-green-50 via-emerald-100 to-lime-50 min-h-[60vh] rounded-xl'>
        {
        categorieData.map((category,index)=>{
          const isOwner = user.role === "admin" || category.createdBy === user._id;
          const canEdit = user.role === "admin" || (user.role === "seller" && category.createdBy === user._id);
          return(
            <div key={category._id} className='w-full max-w-xs h-48 group overflow-hidden shadow-lg rounded-xl flex flex-col bg-white/90 border border-emerald-100 hover:shadow-emerald-200 transition'>
                <div className='flex-1 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-lime-100'>
                  <img
                    alt={category.name}
                    src={category.image}
                    className='max-h-28 max-w-full object-contain group-hover:scale-105 transition'
                  />
                </div>
                <p className="font-semibold text-emerald-900 text-center mt-1 bg-white bg-opacity-80 truncate">{category.name}</p>
                {/* Show action buttons on mobile for admin/owners, on hover for desktop */}
                <div className='h-9 items-center justify-end gap-3 flex lg:hidden px-2'>
                  {canEdit ? (
                    <button
                      onClick={() => {
                        setOpenEdit(true);
                        setEditData(category);
                      }}
                      className='bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded hover:bg-emerald-200 border border-emerald-300 font-medium transition'>Edit</button>
                  ) : (
                    <span className="text-xs text-gray-400">Prohibited</span>
                  )}
                  {isOwner &&  (
                    <button
                      onClick={() => {
                        setOpenConfirmBoxDelete(true);
                        setDeleteCategory(category);
                      }}
                      className='bg-red-100 text-red-600 text-xs px-3 py-1 rounded hover:bg-red-200 border border-red-200 font-medium transition'>Delete</button>
                  )}
                </div>
                {/* Desktop hover buttons */}
                <div className='h-9 items-center justify-end gap-3 hidden lg:group-hover:flex px-2'>
                  {canEdit ? (
                    <button
                      onClick={() => {
                        setOpenEdit(true);
                        setEditData(category);
                      }}
                      className='bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded hover:bg-emerald-200 border border-emerald-300 font-medium transition'>Edit</button>
                  ) : (
                    <span className="text-xs text-gray-400">Prohibited</span>
                  )}
                  {isOwner &&  (
                    <button
                      onClick={() => {
                        setOpenConfirmBoxDelete(true);
                        setDeleteCategory(category);
                      }}
                      className='bg-red-100 text-red-600 text-xs px-3 py-1 rounded hover:bg-red-200 border border-red-200 font-medium transition'>Delete</button>
                  )}
                </div>
              </div>
            
          )
        }
        )
      }
      </div>

      {
        openUploadCategory && (
          <UploadCategory fetchData={fetchCategories} close={()=>setOpenUploadCategory(false)}/>
        )
      }
      { 
        openEdit && (
          <EditCategory data={editData} close={()=>setOpenEdit(false)} fetchData={fetchCategories}/>
        )
      }
      {
        openConfirmBoxDelete && (
          <ConfirmBox close={()=>setOpenConfirmBoxDelete(false)} cancel={()=>setOpenConfirmBoxDelete(false)} confirm={handleDeleteCategoty}/>
        )
      }

      </div>
    </DashboardMobileLayout>
  )
}

export default Category