import React, { use, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Axios from "../utils/Axios";
import summaryApi from "../common/summaryApi";
import { useNotification } from "../context/NotificationContext";
import Loading from "../components/Loading";
import CardProduct from "../components/CardProduct";
import { useSelector } from "react-redux";
import validUrl from "../utils/validUrl";

const ProductList = () => {
  const { axiosNotificationError } = useNotification();
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPage, setTotalPage] = useState(1);
  const params = useParams();
  const allsubCategory = useSelector((state) => state.product.allSubCategory);
  const [DisplaysubCategory, setDisplaysubCategory] = useState([]);
  const subCategoryName = params?.subcategory
    ?.split("-")
    .slice(0, -1)
    .join(" ");
  //console.log("allsubCategory", allsubCategory);

  //console.log("params", params);
  // Add null safety checks for params
  const categoryId = params?.category ? params.category.split("-").slice(-1)[0] : null;
  const subCategoryId = params?.subcategory ? params.subcategory.split("-").slice(-1)[0] : null;
  const fetchProductData = async () => {
    try {
      // Don't fetch if we don't have valid IDs
      if (!categoryId || !subCategoryId) {
        console.warn("Missing category or subcategory ID");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const response = await Axios({
        url: summaryApi.getproductbyCategoryandSubCategory.url,
        method: summaryApi.getproductbyCategoryandSubCategory.method,
        data: {
          page: page,
          limit: 12,
          categoryId: categoryId,
          subCategoryId: subCategoryId,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        if (responseData.page == 1) {
          setData(responseData.data);
        } else {
          setData(...data, responseData.data);
        }
        //console.log("Product Data:", responseData);

        setTotalPage(responseData.totalPage);
      }    } catch (error) {
      axiosNotificationError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [params]);
  useEffect(() => {
    // Add null safety checks
    if (!allsubCategory || !Array.isArray(allsubCategory) || !categoryId) {
      setDisplaysubCategory([]);
      return;
    }
    
    const subCat = allsubCategory.filter((sub) => {
      if (!sub || !sub.category || !Array.isArray(sub.category)) {
        return false;
      }
      const filterData = sub.category.some((el) => {
        return el && el._id === categoryId;
      });
      return filterData ? filterData : null;
    });
    setDisplaysubCategory(subCat);
    console.log("22", subCat);
  }, [params, allsubCategory]);

  //console.log("data", data);

  return (
    <div className="container mx-auto pt-24 lg:pt-20">
      <div className="flex w-full h-[calc(100vh-6rem)]">
        <div className="w-[100px] md:w-[200px] lg:w-[200px]  h-full overflow-y-auto">
          <div className="min-h-[79vh] max-h-[79vh] overflow-y-scroll lg:p-4 flex flex-col items-center justify-start gap-2 p-2 bg-green-200 scrollbarcustom">            {DisplaysubCategory.map((s, index) => {
              // Add null safety checks
              if (!s || !s._id || !s.name || !s.category || !s.category[0] || !s.category[0]._id) {
                return null;
              }
              
              const link=`/${validUrl(s?.category[0]?.name) || ""}-${s.category[0]._id}/${validUrl(s.name) || ""}-${s._id}`;

              return (
                <Link key={s._id + index} to={link}
                  className={`w-full p-2 bg-white lg:flex  lg:w-full lg:h-16
                    hover:bg-green-200
                    ${
                    subCategoryId === s._id ? "bg-green-400" : ""

                  }`}
                >
                  <div className="w-fit mx-auto lg:mx-auto max-w-28 bg-green-200">
                    <img
                      src={s.image}
                      alt="SubCategory"
                      className="w-15 lg:w-12  h-full object-scale-down lg:object-cover"
                    />
                  </div>
                  <p className=" -mt-6 lg:mt-0 text-xs text-center">{s.name}</p>
                </Link>
              );
            })}
            {/* Sub category content goes here */}
          </div>
        </div>

        <div className="flex-1 bg-green-300 h-full overflow-y-auto">
          <div className="p-4">
            <div className="bg-white p-2 shadow-md">
              <h3 className="font-semibold">{subCategoryName}</h3>
            </div>

            <div>
              <div className="min-h-[85vh] max-h-[85vh] overflow-y-scroll scrollbarcustom">                <div className="grid grid-cols-1 p-4 gap-3 md:grid-cols-3  lg:grid-cols-4">
                {data
                  .filter(p => p && p._id && p.name) // Filter out null/invalid products
                  .map((p, index) => {
                    return (
                      <CardProduct
                        data={p}
                        key={p._id + "ProductsubList" + index}
                      />
                    );
                  })}
              </div>
              </div>
              {loading && <Loading />}
            </div>

            {/* Product content goes here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
