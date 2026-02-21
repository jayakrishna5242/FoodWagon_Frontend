
import { Restaurant, MenuItem, Order } from '../types';

export const mockRestaurants: Restaurant[] = [];

export const allMockFoodItems: MenuItem[] = [
  // Keeping these as templates for when new restaurants are added, 
  // though they won't show up until a restaurant with a matching ID is registered.
  { id: 101, name: "Whopper", description: "Flame grilled beef patty", price: 199, imageUrl: "https://picsum.photos/200", isVeg: false, category: "Burgers", restaurantId: 1, restaurantName: "Burger King", inStock: true },
  { id: 102, name: "Veggie Burger", description: "Crispy veggie patty", price: 149, imageUrl: "https://picsum.photos/201", isVeg: true, category: "Burgers", restaurantId: 1, restaurantName: "Burger King", inStock: true },
  { id: 104, name: "Margherita", description: "Classic cheese pizza", price: 299, imageUrl: "https://picsum.photos/203", isVeg: true, category: "Pizzas", restaurantId: 2, restaurantName: "Pizza Hut", inStock: true },
  { id: 112, name: "Masala Dosa", description: "Crispy dosa with potato filling", price: 120, imageUrl: "https://picsum.photos/211", isVeg: true, category: "South Indian", restaurantId: 24, restaurantName: "Sagar Ratna", inStock: true }
];

export const mockOrders: Order[] = [];

export const mockPartnerOrders: Order[] = [];