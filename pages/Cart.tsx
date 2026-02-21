
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAddresses } from '../context/AddressContext';
import { useToast } from '../context/ToastContext';
import { placeOrder } from '../services/api';
import { Minus, Plus, ArrowRight, ShieldCheck, MapPin, Plus as PlusIcon, CheckCircle2, Loader2, Banknote, CreditCard } from 'lucide-react';
import AddressForm from '../components/AddressForm';

type PaymentMethod = 'COD' | 'ONLINE';

const Cart: React.FC = () => {
  const { items, cartTotal, addToCart, removeFromCart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addresses, addAddress, selectedAddressId, setSelectedAddressId } = useAddresses();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');

  const deliveryFee = 30;
  const platformFee = 5;
  const gst = Math.round(cartTotal * 0.05);
  const finalTotal = cartTotal + deliveryFee + platformFee + gst;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      showToast('Please login to place an order.', 'info');
      navigate('/login');
      return;
    }

    if (!selectedAddressId) {
      showToast('Please select a delivery address first.', 'error');
      return;
    }

    if (items.length === 0) return;
    
    setIsPlacingOrder(true);
    try {
      const selectedAddress = addresses.find(a => a.id === selectedAddressId);
      const addressString = selectedAddress ? `${selectedAddress.flatNo}, ${selectedAddress.area}, ${selectedAddress.city}` : 'Unknown Address';
      
      // Extract restaurant info from the first item
      const firstItem = items[0];

      await placeOrder({
        items: [...items],
        totalAmount: finalTotal,
        deliveryAddress: addressString,
        customerName: user?.name,
        customerPhone: "9876543210", // Placeholder
        restaurantName: firstItem.restaurantName || "Local Kitchen",
        restaurantId: firstItem.restaurantId
      });
      
      showToast('Order placed successfully!', 'success');
      clearCart();
      
      setTimeout(() => {
        navigate('/profile');
      }, 800);
    } catch (error) {
      showToast('Failed to place order. Please try again.', 'error');
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <div className="w-64 h-64 mb-6 relative">
          <img 
            src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/2xempty_cart_yfxml0" 
            alt="Empty Cart" 
            className="w-full h-full object-contain opacity-80"
          />
        </div>
        <h2 className="text-xl font-bold text-dark">Your cart is empty</h2>
        <p className="text-graytext text-sm mt-2 mb-8 text-center max-w-xs">You can go to home page to view more restaurants</p>
        <Link 
          to="/" 
          className="bg-primary text-white font-bold py-3 px-6 rounded-md hover:shadow-lg hover:scale-105 transition-all duration-200 uppercase text-sm tracking-wide"
        >
          See Restaurants near you
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e9ecee] py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Side: Account, Address & Payment */}
          <div className="flex-1 space-y-6">
            {/* Account Section */}
            <div className="bg-white p-8 shadow-sm rounded-none md:rounded-sm relative overflow-hidden">
               <div className="absolute left-0 top-8 bottom-8 w-1 bg-black"></div>
               {isAuthenticated ? (
                 <div className="ml-4">
                   <h3 className="font-bold text-lg text-dark mb-1">Logged in</h3>
                   <div className="flex items-center gap-2">
                      <span className="text-graytext text-sm">{user?.name}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span className="text-graytext text-sm">{user?.email}</span>
                   </div>
                 </div>
               ) : (
                 <div className="ml-4">
                   <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-lg text-dark">Account</h3>
                    <Link to="/login" className="text-primary text-xs font-bold hover:underline uppercase">Login</Link>
                   </div>
                   <p className="text-graytext text-sm">To place your order now, log in to your existing account or sign up.</p>
                 </div>
               )}
            </div>
            
            {/* Address Section */}
            <div className="bg-white p-8 shadow-sm rounded-none md:rounded-sm relative overflow-hidden">
              <div className={`absolute left-0 top-8 bottom-8 w-1 ${selectedAddressId ? 'bg-black' : 'bg-gray-200'}`}></div>
              <div className="ml-4">
                <h3 className="font-bold text-lg text-dark mb-4 flex items-center gap-2">
                  Select Delivery Address
                  {selectedAddressId && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                   {addresses.map((addr) => (
                      <div 
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`border-2 p-4 rounded-md cursor-pointer transition-all relative group ${
                          selectedAddressId === addr.id ? 'border-primary bg-orange-50' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                         <div className="flex items-start gap-3">
                            <MapPin className={`w-5 h-5 mt-1 ${selectedAddressId === addr.id ? 'text-primary' : 'text-gray-400'}`} />
                            <div>
                               <p className="font-bold text-sm text-dark">{addr.type}</p>
                               <p className="text-xs text-graytext mt-1 leading-relaxed">
                                 {addr.flatNo}, {addr.area}, {addr.city}
                               </p>
                               {selectedAddressId === addr.id && (
                                 <div className="mt-3">
                                   <span className="bg-black text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-wide">
                                      Deliver Here
                                   </span>
                                 </div>
                               )}
                            </div>
                         </div>
                      </div>
                   ))}

                   <button 
                     onClick={() => setIsAddressModalOpen(true)}
                     className="border-2 border-dashed border-gray-200 p-4 rounded-md flex flex-col items-center justify-center gap-2 text-graytext hover:text-primary hover:border-primary transition-all group min-h-[120px]"
                   >
                      <PlusIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold uppercase">Add New Address</span>
                   </button>
                </div>
              </div>
            </div>
            
            {/* Payment Section */}
            <div className={`bg-white p-8 shadow-sm rounded-none md:rounded-sm relative overflow-hidden ${!selectedAddressId ? 'opacity-50 pointer-events-none' : ''}`}>
               <div className={`absolute left-0 top-8 bottom-8 w-1 ${selectedAddressId ? 'bg-black' : 'bg-gray-200'}`}></div>
               <div className="ml-4">
                  <h3 className="font-bold text-lg text-dark mb-4">Choose Payment Method</h3>
                  
                  <div className="space-y-3">
                     <label 
                        className={`flex items-center justify-between p-4 border-2 rounded-md cursor-pointer transition-all ${
                          paymentMethod === 'COD' ? 'border-primary bg-orange-50' : 'border-gray-100 hover:border-gray-200'
                        }`}
                        onClick={() => setPaymentMethod('COD')}
                     >
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 flex items-center justify-center rounded-full ${paymentMethod === 'COD' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                              <Banknote className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="font-bold text-sm text-dark">Cash on Delivery</p>
                              <p className="text-[10px] text-graytext uppercase tracking-wider font-bold">Pay when food arrives</p>
                           </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-primary' : 'border-gray-300'}`}>
                           {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                     </label>

                     <label 
                        className={`flex items-center justify-between p-4 border-2 rounded-md cursor-pointer transition-all ${
                          paymentMethod === 'ONLINE' ? 'border-primary bg-orange-50' : 'border-gray-100 hover:border-gray-200'
                        }`}
                        onClick={() => setPaymentMethod('ONLINE')}
                     >
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 flex items-center justify-center rounded-full ${paymentMethod === 'ONLINE' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                              <CreditCard className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="font-bold text-sm text-dark">Credit or Debit Card</p>
                              <p className="text-[10px] text-graytext uppercase tracking-wider">Pay securely now</p>
                           </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'ONLINE' ? 'border-primary' : 'border-gray-300'}`}>
                           {paymentMethod === 'ONLINE' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                     </label>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Side: Cart Items & Bill */}
          <div className="w-full md:w-[380px]">
             <div className="bg-white shadow-sm pt-6 pb-0 rounded-none md:rounded-sm relative sticky top-24">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 px-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                     <img src="https://picsum.photos/id/163/100/100" className="w-full h-full object-cover" alt="restaurant" />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-dark text-base truncate relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-[2px] after:bg-black pb-1">Review Items</h3>
                    <p className="text-xs text-graytext mt-1">{items.length} items from Restaurant</p>
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="space-y-0 max-h-[350px] overflow-y-auto px-6 no-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-4 group border-b border-gray-50 last:border-0">
                       <div className="flex items-start gap-3 w-3/5">
                         <div className={`mt-1.5 flex-shrink-0 w-3 h-3 border ${item.isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center p-[1px]`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-sm text-dark font-medium transition-all duration-200">{item.name}</span>
                            <span className="text-xs text-graytext mt-0.5">₹{item.price}</span>
                         </div>
                       </div>
                       
                       <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-200 bg-white shadow-sm rounded-[4px] h-8 w-[70px] justify-between overflow-hidden">
                             <button 
                               onClick={() => removeFromCart(item.id)} 
                               className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all duration-150"
                             >
                               <Minus className="w-3 h-3" strokeWidth={3} />
                             </button>
                             <span className="text-green-600 font-bold text-xs">{item.quantity}</span>
                             <button 
                               onClick={() => addToCart(item)} 
                               className="w-8 h-full flex items-center justify-center text-green-600 hover:bg-green-50 transition-all duration-150"
                             >
                               <Plus className="w-3 h-3" strokeWidth={3} />
                             </button>
                          </div>
                          <span className="text-xs text-graytext w-12 text-right">₹{item.price * item.quantity}</span>
                       </div>
                    </div>
                  ))}
                </div>

                {/* Bill Details */}
                <div className="p-6 space-y-3 bg-white border-t border-gray-100">
                  <div className="flex justify-between text-xs text-graytext">
                    <span>Item Total</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-xs text-graytext">
                    <span className="underline decoration-dotted">Delivery Fee</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                   <div className="flex justify-between text-xs text-graytext">
                    <span>Platform Fee</span>
                    <span>₹{platformFee}</span>
                  </div>
                  <div className="flex justify-between text-xs text-graytext border-b border-gray-200 pb-4">
                    <span>GST and Taxes</span>
                    <span>₹{gst}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                     <span className="font-bold text-dark text-sm">TO PAY</span>
                     <span className="font-bold text-dark text-lg">₹{finalTotal}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button 
                  onClick={handleCheckout}
                  disabled={isPlacingOrder || !selectedAddressId}
                  className={`w-full bg-secondary text-white font-bold py-5 px-6 text-sm shadow-[0_-2px_10px_rgba(0,0,0,0.1)] flex items-center justify-between hover:bg-[#e66f0f] transition-all disabled:opacity-80 disabled:cursor-not-allowed transform active:scale-[0.98]`}
                >
                  <div className="flex flex-col items-start leading-none">
                     <span className="text-[10px] font-normal opacity-80 uppercase tracking-widest mb-1">Total Payable</span>
                     <span className="text-xl">₹{finalTotal}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="uppercase tracking-widest font-black">
                      {isPlacingOrder ? 'Placing Order...' : (!selectedAddressId ? 'Select Address' : 'Place Order')}
                    </span>
                    {isPlacingOrder ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  </div>
                </button>
             </div>
          </div>
        </div>
      </div>

      <AddressForm 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)} 
        onSave={(newAddr) => {
          addAddress(newAddr);
          showToast(`Address "${newAddr.type}" saved.`, "success");
          setIsAddressModalOpen(false);
        }} 
      />
    </div>
  );
};

export default Cart;