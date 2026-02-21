import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo
} from 'react';
import { CartItem, MenuItem } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children?: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { showToast } = useToast();

  /* ---------------- ADD TO CART ---------------- */
  const addToCart = (item: MenuItem) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);

      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...prevItems, { ...item, quantity: 1 }];
    });

    // ✅ Side effect OUTSIDE state updater
    showToast(`Added ${item.name} to cart`, 'success');
  };

  /* ---------------- REMOVE FROM CART ---------------- */
  const removeFromCart = (itemId: number) => {
    const item = items.find(i => i.id === itemId);

    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === itemId);

      if (existingItem && existingItem.quantity > 1) {
        return prevItems.map(i =>
          i.id === itemId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        );
      }

      return prevItems.filter(i => i.id !== itemId);
    });

    if (item) {
      showToast(`Removed ${item.name} from cart`, 'info');
    }
  };

  /* ---------------- CLEAR CART ---------------- */
  const clearCart = () => {
    setItems([]);
  };

  /* ---------------- DERIVED VALUES ---------------- */
  const cartTotal = useMemo(
    () => items.reduce((t, i) => t + i.price * i.quantity, 0),
    [items]
  );

  const cartCount = useMemo(
    () => items.reduce((c, i) => c + i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/* ---------------- HOOK ---------------- */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
