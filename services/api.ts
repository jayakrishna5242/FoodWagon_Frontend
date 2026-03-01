import { Restaurant, MenuItem, Order, AuthResponse, User } from '../types';

const BASE_URL = import.meta.env.VITE_BACKEND_URI + "/api";

/** HELPER: Get current user from storage
 */
const getStoredUser = (): User | null => {
  const saved = localStorage.getItem('foodwagon_user');
  return saved ? JSON.parse(saved) : null;
};

/**
 * TOKEN HELPERS
 */
const getStoredToken = (): string | null => {
  return localStorage.getItem('foodwagon_token');
};

const storeAuthData = (data: AuthResponse) => {
  localStorage.setItem('foodwagon_token', data.token);
  localStorage.setItem('foodwagon_user', JSON.stringify(data.user));
};

const authHeaders = () => {
  const token = getStoredToken();
  return token
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    : { 'Content-Type': 'application/json' };
};


/**
 * 
 * FORGOT PASSWORD
 */
export const generateOtp = async (email: string): Promise<{ message: string }> => {
  const response = await fetch(`${BASE_URL}/auth/forgot-password/generate-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    credentials: 'include'
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to generate OTP');
  }
  return response.json();
};

export const resetPassword = async (email: string, otp: string, newPassword: string): Promise<{ message: string }> => {
  const response = await fetch(`${BASE_URL}/auth/forgot-password/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword }),
    credentials: 'include'
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to reset password');
  }
  return response.json();
};


/**
 * 
 * AUTHENTICATION
 */
export const loginUser = async (
  identifier: string,
  password: string
): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data: AuthResponse = await response.json();
  storeAuthData(data);
  return data;
};

export const registerUser = async (
  fullName: string,
  email: string,
  phone: string,
  password: string
): Promise<AuthResponse> => {

  const payload = {
    name: fullName,
    email: email,
    password: password,
    phone: phone,
  };

  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  const data: AuthResponse = await response.json();
  storeAuthData(data);
  console.log(data);
  return data;

};

export const loginPartner = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/partner/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw new Error('Partner login failed');

  const data: AuthResponse = await response.json();
  storeAuthData(data);
  return data;
};

export const registerPartner = async (
  data: any
): Promise<AuthResponse> => {
  const response = await fetch(`${BASE_URL}/partner/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Partner registration failed');

  const result: AuthResponse = await response.json();
  storeAuthData(result);
  return result;
};

/**
 * CATALOG & SEARCH (Public)
 */
export const fetchRestaurants = async (
  city?: string
): Promise<Restaurant[]> => {
  const url = city
    ? `${BASE_URL}/restaurants?city=${encodeURIComponent(city)}`
    : `${BASE_URL}/restaurants`;

  const response = await fetch(url);
  if (!response.ok) return [];
  return response.json();
};

export const fetchMenu = async (
  restaurantId: number
): Promise<MenuItem[]> => {
  const response = await fetch(
    `${BASE_URL}/restaurants/${restaurantId}/menu`
  );
  if (!response.ok) return [];
  return response.json();
};

export const searchGlobal = async (
  query: string
): Promise<{ restaurants: Restaurant[]; items: MenuItem[] }> => {
  const response = await fetch(
    `${BASE_URL}/restaurants/search?q=${encodeURIComponent(query)}`
  );
  if (!response.ok) return { restaurants: [], items: [] };
  return response.json();
};

/**
 * MENU MANAGEMENT (PARTNER - Protected)
 */
export const addMenuItem = async (
  item: Partial<MenuItem>
): Promise<MenuItem> => {
  const response = await fetch(`${BASE_URL}/menu-items`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(item),
  });

  if (!response.ok) throw new Error('Failed to add menu item');
  return response.json();
};

export const toggleMenuItemStock = async (
  itemId: number
): Promise<MenuItem> => {
  const response = await fetch(
    `${BASE_URL}/menu-items/${itemId}/toggle-stock`,
    {
      method: 'PATCH',
      headers: authHeaders(),
    }
  );

  if (!response.ok) throw new Error('Failed to toggle stock');
  return response.json();
};


export const toggleRestaurantStatus = async (
  restaurantId: number
): Promise<boolean> => {
  const response = await fetch(
    `${BASE_URL}/restaurants/${restaurantId}/toggle`,
    {
      method: "PATCH",
      headers: authHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to toggle restaurant status");
  }

  return response.json(); // assuming backend returns boolean
};

/**
 * ORDERS (Protected)
 */
export const placeOrder = async (
  orderData: any
): Promise<Order> => {
  const user = getStoredUser();

  const payload = {
    userId: user?.id,
    restaurantId: orderData.restaurantId,
    items: orderData.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    totalAmount: orderData.totalAmount,
    deliveryAddress: orderData.deliveryAddress,
    paymentMethod: orderData.paymentMethod || 'COD',
  };

  const response = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error('Order placement failed');
  return response.json();
};

export const fetchOrders = async (): Promise<Order[]> => {
  const user = getStoredUser();
  if (!user) return [];

  const response = await fetch(
    `${BASE_URL}/orders/user/${user.id}`,
    {
      headers: authHeaders(),
    }
  );

  if (!response.ok) return [];
  return response.json();
};

export const fetchPartnerOrders = async (): Promise<Order[]> => {
  const user = getStoredUser();
  if (!user) return [];

  const restaurant = await fetchPartnerRestaurant(user.id);
  if (!restaurant) return [];

  const response = await fetch(
    `${BASE_URL}/orders/restaurant/${restaurant.id}`,
    {
      headers: authHeaders(),
    }
  );

  if (!response.ok) return [];
  return response.json();
};

export const updateOrderStatus = async (
  orderId: number,
  status: Order['status']
): Promise<Order> => {
  const response = await fetch(
    `${BASE_URL}/orders/${orderId}/status`,
    {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) throw new Error('Failed to update status');
  return response.json();
};

/**
 * PARTNER HELPERS (Protected)
 */
export const fetchPartnerRestaurant = async (
  partnerId: number
): Promise<Restaurant | null> => {
  const response = await fetch(
    `${BASE_URL}/partner/${partnerId}/restaurant`,
    {
      headers: authHeaders(),
    }
  );

  if (!response.ok) return null;
  return response.json();
};

export const updateRestaurantDetails = async (
  restaurantId: number,
  details: Partial<Restaurant>
): Promise<Restaurant> => {
  const response = await fetch(
    `${BASE_URL}/restaurants/${restaurantId}`,
    {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(details),
    }
  );

  if (!response.ok) throw new Error('Update failed');
  return response.json();
};

/**
 * LOGOUT
 */
export const logoutUser = () => {
  localStorage.removeItem('foodwagon_token');
  localStorage.removeItem('foodwagon_user');
};