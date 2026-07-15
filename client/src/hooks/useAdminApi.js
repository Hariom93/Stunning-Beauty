import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import toast from 'react-hot-toast';

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export const useDashboard = () =>
  useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return data.analytics;
    },
    staleTime: 60_000, // 1 min
  });

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
export const useAdminProducts = (params = {}) =>
  useQuery({
    queryKey: ['admin-products', params],
    queryFn: async () => {
      const { data } = await api.get('/products', { params: { limit: 200, ...params } });
      return data;
    },
  });

export const useStoreProducts = (params = {}) =>
  useQuery({
    queryKey: ['store-products', params],
    queryFn: async () => {
      const { data } = await api.get('/products', { params });
      return data;
    },
  });


export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product created successfully!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create product'),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product updated!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update product'),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success('Product deleted.');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete product'),
  });
};

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.categories;
    },
    staleTime: 120_000,
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/categories', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create category'),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => api.put(`/categories/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update category'),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted.');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete category'),
  });
};

// ─── BRANDS ───────────────────────────────────────────────────────────────────
export const useBrands = () =>
  useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data } = await api.get('/brands');
      return data.brands;
    },
    staleTime: 120_000,
  });

export const useCreateBrand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/brands', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brand created!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create brand'),
  });
};

export const useUpdateBrand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => api.put(`/brands/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brand updated!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update brand'),
  });
};

export const useDeleteBrand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/brands/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brand deleted.');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete brand'),
  });
};

// ─── ORDERS ───────────────────────────────────────────────────────────────────
export const useAdminOrders = () =>
  useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders/admin');
      return data.orders;
    },
  });

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, orderStatus }) => api.put(`/orders/${id}/status`, { status: orderStatus }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success('Order status updated!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update order status'),
  });
};

// ─── USERS ────────────────────────────────────────────────────────────────────
export const useAdminUsers = () =>
  useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
      return data.users;
    },
  });

export const useToggleUserRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.put(`/admin/users/${id}/role`),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success(res.data.message || 'Role updated!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update role'),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success('User deleted.');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete user'),
  });
};

// ─── BANNERS ──────────────────────────────────────────────────────────────────
export const useAdminBanners = () =>
  useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const { data } = await api.get('/admin/banners');
      return data.banners;
    },
  });

export const useActiveBanners = () =>
  useQuery({
    queryKey: ['active-banners'],
    queryFn: async () => {
      const { data } = await api.get('/banners');
      return data.banners;
    },
  });

export const useCreateBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/admin/banners', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-banners'] });
      qc.invalidateQueries({ queryKey: ['active-banners'] });
      toast.success('Banner created!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create banner'),
  });
};

export const useToggleBannerStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.put(`/admin/banners/${id}/status`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-banners'] });
      qc.invalidateQueries({ queryKey: ['active-banners'] });
      toast.success('Banner status updated!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update status'),
  });
};

export const useDeleteBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/admin/banners/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-banners'] });
      qc.invalidateQueries({ queryKey: ['active-banners'] });
      toast.success('Banner deleted.');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete banner'),
  });
};

// ─── COUPONS ──────────────────────────────────────────────────────────────────
export const useCoupons = () =>
  useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data } = await api.get('/coupons');
      return data.coupons;
    },
  });

export const useCreateCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/coupons', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon created!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create coupon'),
  });
};

export const useDeleteCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/coupons/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons'] });
      toast.success('Coupon deleted.');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete coupon'),
  });
};

export const useApplyCoupon = () =>
  useMutation({
    mutationFn: (body) => api.post('/coupons/apply', body),
  });

// ─── CUSTOMER ORDERS ──────────────────────────────────────────────────────────
export const useMyOrders = () =>
  useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders/my-orders');
      return data.orders;
    },
  });

export const useOrderDetails = (id) =>
  useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data.order;
    },
    enabled: !!id,
  });

export const useCancelOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.put(`/orders/${id}`),
    onSuccess: (res, id) => {
      qc.invalidateQueries({ queryKey: ['my-orders'] });
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success('Order cancelled successfully.');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to cancel order'),
  });
};

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
export const useProductReviews = (productId) =>
  useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/${productId}`);
      return data.reviews;
    },
    enabled: !!productId,
  });

export const useCreateReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, ...body }) => api.post(`/reviews/${productId}`, body),
    onSuccess: (res, { productId }) => {
      qc.invalidateQueries({ queryKey: ['reviews', productId] });
      qc.invalidateQueries({ queryKey: ['product', productId] });
      toast.success('Review submitted successfully!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to submit review'),
  });
};

export const useProductDetail = (slugOrId) =>
  useQuery({
    queryKey: ['product', slugOrId],
    queryFn: async () => {
      const { data } = await api.get(`/products/${slugOrId}`);
      return data;
    },
    enabled: !!slugOrId,
  });

// ─── ADDRESSES ───────────────────────────────────────────────────────────────
export const useAddresses = () =>
  useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const { data } = await api.get('/addresses');
      return data.addresses;
    },
  });

export const useCreateAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => api.post('/addresses', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address added successfully!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to add address'),
  });
};

export const useUpdateAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }) => api.put(`/addresses/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address updated successfully!');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update address'),
  });
};

export const useDeleteAddress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/addresses/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address deleted successfully.');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete address'),
  });
};


