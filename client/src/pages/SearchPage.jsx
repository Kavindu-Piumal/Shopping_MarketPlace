import React, { useEffect, useState } from "react";
import CartLoading from "../components/CardLoading";
import summaryApi from "../common/summaryApi";
import Axios from "../utils/Axios";
import { useNotification } from "../context/NotificationContext";
import CardProduct from "../components/CardProduct";
import InfiniteScroll from "react-infinite-scroll-component";
import { useLocation } from "react-router-dom";
import nothing from "../assets/nothing.png";
import { FaSearch, FaLeaf, FaRecycle, FaFilter } from "react-icons/fa";

const SearchPage = () => {
  const { axiosNotificationError } = useNotification();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadingArrayCard = new Array(10).fill(null);

  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const params = useLocation();
  const searchText = params?.search?.slice(3);

  // Reset page and data when searchText changes
  useEffect(() => {
    setPage(1);
    setData([]);
  }, [searchText]);

  const fetchSearchData = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        url: summaryApi.searchProducts.url,
        method: summaryApi.searchProducts.method,
        data: {
          search: searchText,
          page: page,
          limit: 30,
        },
      });
      const { data: responseData } = response;

      if (responseData.success) {
        if (page === 1) {
          setData(responseData.data);
        } else {
          setData((prev) => {
            return [...prev, ...responseData.data];
          });
        }
        setTotalPage(responseData.totalPage);
      }    } catch (error) {
      axiosNotificationError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchData();
  }, [page, searchText]);

  const fetchMoreData = async () => {
    if (totalPage > page) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <section className="bg-white min-h-screen">
      <div className="container mx-auto p-4 min-h-[calc(100vh-80px)]">
        <p className="font-semibold">Search Results: {data.length}</p>
        <InfiniteScroll
          dataLength={data.length}
          hasMore={page < totalPage} // Only true if more pages are available
          next={fetchMoreData}
        >
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 py-5 gap-2 sm:gap-3 lg:gap-4 min-h-[calc(100vh-160px)]">
            {data.map((item, index) => {
              return <CardProduct data={item} key={"searchproduct" + index} />;
            })}

            {
              // If no data is found, show a message
              !data[0] && !loading && (
                <div className="col-span-full flex flex-col items-center justify-center min-h-[50vh]">
                  <img src={nothing} alt="No results found" className="w-25 h-25" />
                  <p className="text-gray-500">No results found for "{searchText}"</p>
                </div>
              )
            }

            {/* Loading Data */}
            {loading &&
              loadingArrayCard.map((_, index) => {
                return <CartLoading key={index} />;
              })}
          </div>
        </InfiniteScroll>
      </div>
    </section>
  );
};

export default SearchPage;
