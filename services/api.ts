
import { Restaurant, MenuItem, Order, AuthResponse, User } from '../types';

const BASE_URL = 'https://food-wagon-backend-oc5c.onrender.com/api';

/**
 * HELPER: Get current user from storage to avoid changing component signatures
 */
const getStoredUser = (): User | null => {
  const saved = localStorage.getItem('foodwagon_user');
  return saved ? JSON.parse(saved) : null;
};

/**
 * AUTHENTICATION
 */
export const loginUser = async (identifier: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  
  const data = await response.json();
  // Ensure we return a token even if backend doesn't provide one (for frontend compatibility)
  return {
    token: `session_${Date.now()}`, 
    user: data.user
  };
};

export const registerUser = async (fullName: string, identifier: string, password: string): Promise<AuthResponse> => {
  const isEmail = identifier.includes('@');
  const payload = {
    name: fullName,
    email: isEmail ? identifier : `${identifier}@placeholder.com`,
    password: password,
    phone: !isEmail ? identifier : "0000000000" // Fallback if only email provided
  };

  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Registration failed");
  const data = await response.json();
  return {
    token: `session_${Date.now()}`,
    user: data.user
  };
};

export const loginPartner = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/partner/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw new Error("Partner login failed");
  const data = await response.json();
  return {
    token: `partner_session_${Date.now()}`,
    user: data.user
  };
};

export const registerPartner = async (data: any): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/partner/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Partner registration failed");
  const result = await response.json();
  return {
    token: `partner_session_${Date.now()}`,
    user: result.user
  };
};

/**
 * CATALOG & SEARCH
 */
export const fetchRestaurants = async (city?: string): Promise<Restaurant[]> => {
  const url = city ? `${BASE_URL}/restaurants?city=${encodeURIComponent(city)}` : `${BASE_URL}/restaurants`;
  const response = await fetch(url);
  if (!response.ok) return [];
  return response.json();
};

export const fetchMenu = async (restaurantId: number): Promise<MenuItem[]> => {
  const response = await fetch(`${BASE_URL}/restaurants/${restaurantId}/menu`);
  if (!response.ok) return [];
  return response.json();
};

export const searchGlobal = async (query: string): Promise<{ restaurants: Restaurant[], items: MenuItem[] }> => {
  const response = await fetch(`${BASE_URL}/restaurants/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) return { restaurants: [], items: [] };
  return response.json();
};

/**
 * MENU MANAGEMENT (PARTNER)
 */
export const addMenuItem = async (item: Partial<MenuItem>): Promise<MenuItem> => {
  const response = await fetch(`${BASE_URL}/menu-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!response.ok) throw new Error("Failed to add menu item");
  return response.json();
};

export const toggleMenuItemStock = async (itemId: number): Promise<MenuItem> => {
  const response = await fetch(`${BASE_URL}/menu-items/${itemId}/toggle-stock`, {
    method: 'PATCH'
  });
  if (!response.ok) throw new Error("Failed to toggle stock");
  return response.json();
};

/**
 * ORDERS
 */
export const placeOrder = async (orderData: any): Promise<Order> => {
  const user = getStoredUser();
  
  // Construct the payload to match your @POST /api/orders spec exactly
  const payload = {
    userId: user?.id,
    restaurantId: orderData.restaurantId,
    items: orderData.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    })),
    totalAmount: orderData.totalAmount,
    deliveryAddress: orderData.deliveryAddress,
    paymentMethod: orderData.paymentMethod || "COD"
  };

  const response = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Order placement failed");
  return response.json();
};

export const fetchOrders = async (): Promise<Order[]> => {
  const user = getStoredUser();
  if (!user) return [];
  
  const response = await fetch(`${BASE_URL}/orders/user/${user.id}`);
  if (!response.ok) return [];
  return response.json();
};

export const fetchPartnerOrders = async (): Promise<Order[]> => {
  const user = getStoredUser();
  if (!user) return [];

  // First get the restaurant to get the restaurantId
  const restaurant = await fetchPartnerRestaurant(user.id);
  if (!restaurant) return [];

  const response = await fetch(`${BASE_URL}/orders/restaurant/${restaurant.id}`);
  if (!response.ok) return [];
  return response.json();
};

export const updateOrderStatus = async (orderId: number, status: Order['status']): Promise<Order> => {
  const response = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  
  if (!response.ok) throw new Error("Failed to update status");
  // The spec says response mirrors the request { status: "..." }
  return response.json();
};

/**
 * PARTNER HELPERS
 */
export const fetchPartnerRestaurant = async (partnerId: number): Promise<Restaurant | null> => {
  const response = await fetch(`${BASE_URL}/partner/${partnerId}/restaurant`);
  if (!response.ok) return null;
  return response.json();
};

export const updateRestaurantDetails = async (restaurantId: number, details: Partial<Restaurant>): Promise<Restaurant> => {
  // Assuming a PUT endpoint exists based on similar patterns
  const response = await fetch(`${BASE_URL}/restaurants/${restaurantId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  });
  if (!response.ok) throw new Error("Update failed");
  return response.json();
};
