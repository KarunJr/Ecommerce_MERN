import React, { useEffect, useState } from 'react'
import axios from '../lib/axios'
import ProductCard from './ProductCard'
import toast from 'react-hot-toast'
import LoadingSpinner from "../components/LoadingSpinner"
const PeopleAlsoBought = () => {
  const [recommendations, setRecommendations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    try {
      const fetchRecommendations = async()=>{
        const res = await axios.get("/products/recommendations")
        setRecommendations(res.data)
      }
      fetchRecommendations()
    } catch (error) {
      toast.error(error.response.data.message || "An error occured while fethcing the recommendations.")
    }finally{
      setIsLoading(false)
    }
  }, [])
  if(isLoading) return <LoadingSpinner/>
  return (
    <div className='mt-8'>
      <h3 className='text-2xl font-semibold text-emerald-400'>
        People also bought
      </h3>

      <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {recommendations.map((product)=>(
          <ProductCard key = {product._id} product = {product}/>
        ))}
      </div>
    </div>
  )
}

export default PeopleAlsoBought
