
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { fetchPartnerOrders, fetchMenu, fetchPartnerRestaurant, updateRestaurantDetails, addMenuItem, updateOrderStatus } from '../services/api';
import { Order, MenuItem, Restaurant } from '../types';
import { 
  Bell, 
  Menu, 
  BarChart, 
  Settings, 
  LogOut, 
  Utensils, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  DollarSign,
  Package,
  Plus,
  X,
  Image as ImageIcon,
  MapPin,
  Store,
  ChefHat,
  Star,
  ChevronRight,
  Info,
  Loader2
} from 'lucide-react';

type Tab = 'live' | 'menu' | 'insights' | 'profile';

const PartnerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('live');
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submittingItem, setSubmittingItem] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  // Add Item Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemData, setNewItemData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isVeg: true,
    imageUrl: ''
  });

  useEffect(() => {
    // Fixed case sensitivity for role check
    if (!user || user.role !== 'PARTNER') {
      navigate('/partner/login');
      return;
    }

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const resData = await fetchPartnerRestaurant(user.id);
        setRestaurant(resData);
        
        if (resData) {
          const [orderData, menuData] = await Promise.all([
            fetchPartnerOrders(),
            fetchMenu(resData.id)
          ]);
          setOrders(orderData);
          setMenuItems(menuData);
        }
      } catch (e) {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user, navigate]);

  const handleStatusChange = async (orderId: number, newStatus: Order['status']) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast(`Order #${orderId} is now ${newStatus.toLowerCase()}.`, 'success');
    } catch (err) {
      showToast("Failed to update status", "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleStockToggle = (itemId: number) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newState = !item.inStock;
        showToast(`${item.name} is now ${newState ? 'available' : 'out of stock'}.`, 'info');
        return { ...item, inStock: newState };
      }
      return item;
    }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    if (!newItemData.imageUrl) {
      showToast("Please provide a dish image URL", "error");
      return;
    }

    setSubmittingItem(true);
    try {
      const newItem: MenuItem = {
        id: Date.now(),
        name: newItemData.name,
        description: newItemData.description,
        price: Number(newItemData.price),
        imageUrl: newItemData.imageUrl,
        isVeg: newItemData.isVeg,
        category: newItemData.category || "General",
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        inStock: true
      };

      // PERSIST TO API SESSION STORE
      await addMenuItem(newItem);
      
      setMenuItems(prev => [newItem, ...prev]);
      showToast(`${newItem.name} added to your menu!`, 'success');
      setIsAddModalOpen(false);
      setNewItemData({ name: '', description: '', price: '', category: '', isVeg: true, imageUrl: '' });
    } catch (err) {
      showToast("Failed to add menu item", "error");
    } finally {
      setSubmittingItem(false);
    }
  };

  const calculateTotalRevenue = () => {
    return orders.reduce((acc, order) => acc + order.totalAmount, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold animate-pulse">Loading Dashboard...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col p-6 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Not Found</h2>
          <p className="text-gray-500 mb-8">We couldn't find a restaurant associated with your partner account.</p>
          <button onClick={() => navigate('/partner/register')} className="w-full bg-primary text-white font-bold py-3 rounded-xl">Register Your Restaurant</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative font-sans text-gray-900">
      {/* TOP HEADER */}
      <header className="bg-white shadow-sm z-30 px-6 py-4 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-orange-500/20">
             <Utensils className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">{restaurant.name}</h1>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span className={isOnline ? 'text-green-600' : 'text-red-600'}>{isOnline ? 'Active' : 'Offline'}</span>
              <span className="text-gray-300 mx-1">|</span>
              <span className="text-gray-400">{restaurant.city}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="hidden md:flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
              <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
              <span className="text-sm font-bold">{restaurant.rating || 'N/A'}</span>
           </div>
           
           <button 
             onClick={() => {
                const newState = !isOnline;
                setIsOnline(newState);
                showToast(`Store is now ${newState ? 'taking orders' : 'closed'}.`, newState ? 'success' : 'info');
             }}
             className={`px-6 py-2 rounded-full text-xs font-black transition-all transform active:scale-95 ${isOnline ? 'bg-green-600 text-white shadow-lg shadow-green-500/20' : 'bg-gray-200 text-gray-600'}`}
           >
             {isOnline ? 'ONLINE' : 'OFFLINE'}
           </button>
           
           <div className="h-8 w-[1px] bg-gray-200"></div>
           
           <button onClick={() => { logout(); showToast("Dashboard signed out.", "info"); navigate('/partner'); }} className="group p-2 hover:bg-red-50 rounded-lg transition-colors" title="Logout">
             <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
           </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-20 lg:w-72 bg-[#0d0f17] text-white flex flex-col border-r border-white/5">
           <div className="p-6 hidden lg:block">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                 <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-primary font-bold">
                    {user?.name.charAt(0)}
                 </div>
                 <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">{user?.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-black">Admin</p>
                 </div>
              </div>
           </div>

           <nav className="flex-1 pt-4 space-y-2 px-3">
              <button 
                onClick={() => setActiveTab('live')}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${activeTab === 'live' ? 'bg-primary text-white shadow-xl shadow-orange-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                 <Bell className="w-5 h-5" />
                 <span className="hidden lg:inline font-bold text-sm">Kitchen Display</span>
                 {orders.filter(o => o.status === 'PENDING').length > 0 && (
                   <span className="ml-auto bg-white text-primary text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                     {orders.filter(o => o.status === 'PENDING').length}
                   </span>
                 )}
              </button>
              
              <button 
                onClick={() => setActiveTab('menu')}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${activeTab === 'menu' ? 'bg-primary text-white shadow-xl shadow-orange-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                 <ChefHat className="w-5 h-5" />
                 <span className="hidden lg:inline font-bold text-sm">Menu Builder</span>
              </button>

              <button 
                onClick={() => setActiveTab('insights')}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${activeTab === 'insights' ? 'bg-primary text-white shadow-xl shadow-orange-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                 <BarChart className="w-5 h-5" />
                 <span className="hidden lg:inline font-bold text-sm">Store Insights</span>
              </button>

              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-primary text-white shadow-xl shadow-orange-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                 <Store className="w-5 h-5" />
                 <span className="hidden lg:inline font-bold text-sm">Store Profile</span>
              </button>
           </nav>
           
           <div className="p-6 border-t border-white/5">
              <button className="flex items-center gap-3 text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
                 <Settings className="w-4 h-4" />
                 <span className="hidden lg:inline">Settings</span>
              </button>
           </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-10 no-scrollbar">
           
           {/* TAB: LIVE ORDERS */}
           {activeTab === 'live' && (
             <div className="animate-in fade-in duration-500">
               <div className="flex justify-between items-end mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900">Live Queue</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage incoming and active orders</p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                     <div className="text-center border-r border-gray-100 pr-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">New</p>
                        <p className="text-lg font-black text-red-500">{orders.filter(o => o.status === 'PENDING').length}</p>
                     </div>
                     <div className="text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Preparing</p>
                        <p className="text-lg font-black text-orange-500">{orders.filter(o => o.status === 'PREPARING').length}</p>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    { status: 'PENDING', label: 'Incoming', nextLabel: 'ACCEPT ORDER', nextStatus: 'PREPARING', color: 'red-500' },
                    { status: 'PREPARING', label: 'In Kitchen', nextLabel: 'MARK AS READY', nextStatus: 'READY', color: 'orange-500' },
                    { status: 'READY', label: 'Awaiting Pickup', nextLabel: 'DISPATCH ORDER', nextStatus: 'DELIVERED', color: 'green-600' }
                  ].map(step => (
                    <div key={step.status} className="flex flex-col gap-6">
                       <div className="flex items-center justify-between">
                          <h3 className={`text-xs font-black uppercase tracking-widest text-${step.color}`}>{step.label}</h3>
                          <span className="bg-gray-200/50 text-gray-500 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                             {orders.filter(o => o.status === step.status).length}
                          </span>
                       </div>
                       
                       <div className="space-y-4">
                        {orders.filter(o => o.status === step.status).map(order => (
                          <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 relative overflow-hidden group hover:shadow-xl transition-all">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[10px] font-black text-gray-300 uppercase">#ORD-{order.id}</span>
                                    <h4 className="font-bold text-gray-900 leading-tight">{order.customerName}</h4>
                                    <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[150px]">{order.deliveryAddress}</p>
                                </div>
                                <div className="bg-gray-50 px-2 py-1 rounded-lg text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>

                              <div className="space-y-2 mb-6 border-b border-gray-100 pb-4">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-xs">
                                      <span className="text-gray-600 font-medium">
                                        <span className="bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded mr-2 font-black">{item.quantity}</span>
                                        {item.name}
                                      </span>
                                  </div>
                                ))}
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="font-black text-gray-900">₹{order.totalAmount}</span>
                                
                                <button 
                                  disabled={updatingOrderId === order.id}
                                  onClick={() => handleStatusChange(order.id, step.nextStatus as Order['status'])} 
                                  className={`bg-gray-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black hover:bg-black transition-all flex items-center gap-2 ${step.status === 'READY' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                >
                                  {updatingOrderId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : step.nextLabel}
                                </button>
                              </div>
                          </div>
                        ))}
                        
                        {orders.filter(o => o.status === step.status).length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Empty</p>
                            </div>
                        )}
                       </div>
                    </div>
                  ))}
               </div>
             </div>
           )}

           {/* TAB: STORE PROFILE */}
           {activeTab === 'profile' && (
             <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                   <div className="h-48 bg-gray-900 relative">
                      <img src={restaurant.imageUrl} className="w-full h-full object-cover opacity-60" alt="Restaurant Background" />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                      <div className="absolute bottom-6 left-8 flex items-end gap-6">
                         <div className="w-24 h-24 bg-white p-1 rounded-2xl shadow-2xl">
                            <div className="w-full h-full bg-primary rounded-xl flex items-center justify-center">
                               <Store className="text-white w-10 h-10" />
                            </div>
                         </div>
                         <div className="mb-2">
                            <h2 className="text-3xl font-black text-white">{restaurant.name}</h2>
                            <p className="text-orange-400 font-bold flex items-center gap-2">
                               <Star className="w-4 h-4 fill-orange-400" /> {restaurant.rating || 'New Store'} • {restaurant.city}
                            </p>
                         </div>
                      </div>
                   </div>

                   <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                         <section>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Business Details</h3>
                            <div className="space-y-4">
                               <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                                  <Info className="w-5 h-5 text-gray-400 mt-1" />
                                  <div>
                                     <p className="text-[10px] font-bold text-gray-400 uppercase">Cuisines</p>
                                     <p className="text-sm font-bold">
                                        {Array.isArray(restaurant.cuisines)
                                          ? restaurant.cuisines.join(', ')
                                          : restaurant.cuisines}
                                      </p>
                                  </div>
                               </div>
                               <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                                  <Clock className="w-5 h-5 text-gray-400 mt-1" />
                                  <div>
                                     <p className="text-[10px] font-bold text-gray-400 uppercase">Delivery Time</p>
                                     <p className="text-sm font-bold">{restaurant.deliveryTime}</p>
                                  </div>
                               </div>
                               <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                                  <DollarSign className="w-5 h-5 text-gray-400 mt-1" />
                                  <div>
                                     <p className="text-[10px] font-bold text-gray-400 uppercase">Cost for Two</p>
                                     <p className="text-sm font-bold">{restaurant.costForTwo}</p>
                                  </div>
                               </div>
                            </div>
                         </section>
                      </div>

                      <div className="space-y-8">
                         <section>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Location & Contact</h3>
                            <div className="space-y-4">
                               <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                                  <div>
                                     <p className="text-[10px] font-bold text-gray-400 uppercase">Full Address</p>
                                     <p className="text-sm font-bold">{restaurant.location}, {restaurant.city}</p>
                                  </div>
                               </div>
                               <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                                  <Bell className="w-5 h-5 text-gray-400 mt-1" />
                                  <div>
                                     <p className="text-[10px] font-bold text-gray-400 uppercase">Store Status</p>
                                     <p className={`text-sm font-bold ${isOnline ? 'text-green-600' : 'text-red-500'}`}>
                                        {isOnline ? 'Open for orders' : 'Currently Closed'}
                                     </p>
                                  </div>
                               </div>
                            </div>
                         </section>

                         <button className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2">
                            Edit Store Profile <ChevronRight className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {/* TAB: MENU MANAGEMENT */}
           {activeTab === 'menu' && (
             <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                       <div className="flex items-center gap-4">
                          <h2 className="text-2xl font-black text-gray-900">Menu Catalog</h2>
                          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#e66f0f] transition-all shadow-lg shadow-orange-500/20">
                            <Plus className="w-4 h-4" /> New Dish
                          </button>
                       </div>
                       <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span> Available</span>
                          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-300"></span> Out of Stock</span>
                       </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                       {menuItems.length === 0 ? (
                         <div className="p-20 text-center">
                            <Utensils className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Your menu is empty</p>
                            <button onClick={() => setIsAddModalOpen(true)} className="text-primary font-bold mt-2 hover:underline">Add your first item</button>
                         </div>
                       ) : (
                         menuItems.map(item => (
                            <div key={item.id} className="p-6 flex items-center justify-between hover:bg-gray-50/80 transition-all group">
                               <div className="flex items-center gap-6">
                                  <div className="relative">
                                    <img src={item.imageUrl} alt={item.name} className={`w-16 h-16 rounded-2xl object-cover shadow-sm transition-all ${!item.inStock ? 'grayscale opacity-30' : 'group-hover:scale-105'}`} />
                                    <div className={`absolute -top-1 -left-1 w-3 h-3 rounded-full border-2 border-white ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                  </div>
                                  <div>
                                     <h3 className={`font-bold text-lg ${!item.inStock ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.name}</h3>
                                     <p className="text-xs font-bold text-gray-500 tracking-tight">₹{item.price} • {item.category}</p>
                                  </div>
                               </div>
                               <div className="flex items-center gap-8">
                                  <div className="hidden md:block text-right">
                                     <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Inventory</p>
                                     <p className={`text-xs font-bold ${item.inStock ? 'text-green-600' : 'text-gray-400'}`}>{item.inStock ? 'In Stock' : 'Out of Stock'}</p>
                                  </div>
                                  <button 
                                    onClick={() => handleStockToggle(item.id)}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all ${item.inStock !== false ? 'bg-green-500' : 'bg-gray-200'}`}
                                  >
                                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${item.inStock !== false ? 'translate-x-6' : 'translate-x-1'}`} />
                                  </button>
                               </div>
                            </div>
                         ))
                       )}
                    </div>
                </div>
             </div>
           )}

           {/* TAB: INSIGHTS */}
           {activeTab === 'insights' && (
              <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
                 <h2 className="text-3xl font-black text-gray-900">Performance Metrics</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all">
                       <div className="flex items-center justify-between mb-6">
                          <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest">Total Sales</h3>
                          <div className="bg-green-50 p-3 rounded-2xl">
                             <DollarSign className="w-6 h-6 text-green-600" />
                          </div>
                       </div>
                       <p className="text-4xl font-black text-gray-900">₹{calculateTotalRevenue()}</p>
                       <p className="text-green-600 text-xs font-bold mt-4 flex items-center gap-1.5 bg-green-50 w-fit px-3 py-1 rounded-full">
                          <TrendingUp className="w-3 h-3" /> +12.5% vs Prev Week
                       </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all">
                       <div className="flex items-center justify-between mb-6">
                          <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest">Orders Fulfilled</h3>
                          <div className="bg-blue-50 p-3 rounded-2xl">
                             <Package className="w-6 h-6 text-blue-600" />
                          </div>
                       </div>
                       <p className="text-4xl font-black text-gray-900">{orders.length}</p>
                       <p className="text-blue-600 text-xs font-bold mt-4 flex items-center gap-1.5 bg-blue-50 w-fit px-3 py-1 rounded-full">
                          <TrendingUp className="w-3 h-3" /> +5.2% vs Prev Week
                       </p>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all">
                       <div className="flex items-center justify-between mb-6">
                          <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest">Store Rating</h3>
                          <div className="bg-orange-50 p-3 rounded-2xl">
                             <Star className="w-6 h-6 text-orange-500 fill-orange-500" />
                          </div>
                       </div>
                       <p className="text-4xl font-black text-gray-900">{restaurant.rating || '4.2'}</p>
                       <p className="text-gray-400 text-xs font-bold mt-4 tracking-tighter uppercase">Based on 124 Reviews</p>
                    </div>
                 </div>
              </div>
           )}

        </main>
      </div>

      {/* ADD ITEM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center p-8 border-b border-gray-50">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Add New Dish</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="bg-gray-100 p-2 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-8 space-y-6">
               <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Item Name</label>
                  <input 
                    type="text" 
                    required
                    value={newItemData.name}
                    onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
                    placeholder="e.g. Garlic Naan"
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                  />
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Price (₹)</label>
                    <input 
                      type="number" 
                      required
                      value={newItemData.price}
                      onChange={(e) => setNewItemData({...newItemData, price: e.target.value})}
                      placeholder="e.g. 150"
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                    <input 
                      type="text" 
                      required
                      value={newItemData.category}
                      onChange={(e) => setNewItemData({...newItemData, category: e.target.value})}
                      placeholder="e.g. Breads"
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                    />
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Dish Image URL <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type="url" 
                      required
                      value={newItemData.imageUrl}
                      onChange={(e) => setNewItemData({...newItemData, imageUrl: e.target.value})}
                      placeholder="https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                      className="w-full px-5 py-3.5 pl-11 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-xs"
                    />
                    <ImageIcon className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium italic">Enter a valid URL for a high-quality dish image.</p>
               </div>

               <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea 
                    rows={3}
                    value={newItemData.description}
                    onChange={(e) => setNewItemData({...newItemData, description: e.target.value})}
                    placeholder="Briefly describe the ingredients or taste..."
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium resize-none"
                  />
               </div>

               <div className="flex gap-8 items-center bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Dietary Type</p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="diet"
                        checked={newItemData.isVeg}
                        onChange={() => setNewItemData({...newItemData, isVeg: true})}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-bold text-gray-700 group-hover:text-green-600 transition-colors">Pure Veg</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="diet"
                        checked={!newItemData.isVeg}
                        onChange={() => setNewItemData({...newItemData, isVeg: false})}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm font-bold text-gray-700 group-hover:text-red-600 transition-colors">Non-Veg</span>
                    </label>
                  </div>
               </div>

               <button 
                 type="submit"
                 disabled={submittingItem}
                 className="w-full bg-primary text-white font-black py-4 rounded-2xl hover:bg-[#e66f0f] transition-all mt-4 shadow-xl shadow-orange-500/20 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
               >
                 {submittingItem ? (
                   <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                 ) : "Create Menu Item"}
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerDashboard;
