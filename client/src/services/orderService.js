import api from './api';

export const placeOrder = (address) => api.post('/orders/place', { address });

export const getMyOrders = () => api.get('/orders/my-orders');

export const getOrderById = (id) => api.get(`/orders/${id}`);
