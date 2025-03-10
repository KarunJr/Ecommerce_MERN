import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,
  error: null,

  setProducts: (products) => set({ products }), // Later on i can use it and can understand this

  createProduct: async (productData) => {
    set({ loading: true });
    try {
      const res = await axios.post("/products", productData);
      toast.success("Product added successfully");
      set((prevState) => ({
        products: [...prevState.products, res.data],
        loading: false,
      }));
    } catch (error) {
      toast.error(error.response.data.error);
      set({ loading: false });
    }
  },

  fetchAllProducts: async () => {
    set({ loading: true });

    try {
      const res = await axios.get("/products");
      set({ products: res.data.products, loading: false });
    } catch (error) {
      toast.error(error.response.data.error);
      set({ loading: false });
    }
  },

  fetchProductsByCategory: async(category)=>{
    set({loading:true});
    try {
      const response = await axios.get(`/products/category/${category}`);
      set({products: response.data.products})
    } catch (error) {
      set({loading: false})
      toast.error(error.response.data.error || "Failed to fetch product")
    }
  },

  deleteProduct: async (productId) => {
    set({loading: true})
    try {
      const response = await axios.delete(`/products/${productId}`);
      toast.success("Product deleted successfully")
      set((prevProducts)=>({
        products: prevProducts.products.filter((product)=> product._id !== productId),
        loading: false
      }))

    } catch (error) {
      set({loading: false})
      toast.error(error.response.data.error || "Failed to delete product")
    }
  },

  toggleFeaturedProduct: async (productId) => {
    set({loading:true})
    try {
      const response = await axios.patch(`/products/${productId}`)
      // this will update isFeatured prop of the element
      set((prevProducts)=>({
        products: prevProducts.products.map((product)=>
        product._id === productId ? {...product, isFeatured: response.data.isFeatured} : product
        ),
        loading: false
      }))
    } catch (error) {
      set({loading: false})
      toast.error(error.response.data.error || "Failed to update product")
    }
  },

  fetchFeaturedProducts: async()=>{
    set({loading: true})
    try {
      const response = await axios.get("/products/featured");
      set({products: response.data, loading: false});
    } catch (error) {
      set({loading: false, error: "Failed to fetch featured products"})
    }
  }
}));
