
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Utensils, ArrowLeft, Mail, Lock } from 'lucide-react';
import { loginPartner } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PartnerLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const authResponse = await loginPartner(email, password);
      login(authResponse.token, authResponse.user);
      navigate('/partner/dashboard');
    } catch (err: any) {
      setError('Invalid partner credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f17] flex relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
         <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#fc8019] rounded-full blur-[150px] opacity-10"></div>
         <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 flex flex-col items-center justify-center relative z-10">
        
        <div className="w-full max-w-md">
           <Link to="/partner" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Partner Home
           </Link>

           <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                 <div>
                    <h2 className="text-xl font-bold text-gray-900">Partner Login</h2>
                    <p className="text-xs text-gray-500 mt-1">Manage your restaurant</p>
                 </div>
                 <div className="w-10 h-10 bg-[#fc8019] rounded-lg flex items-center justify-center">
                    <Utensils className="text-white w-6 h-6" />
                 </div>
              </div>

              <div className="p-8">
                 {error && (
                   <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                     {error}
                   </div>
                 )}
                 <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                       <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Email Address</label>
                       <div className="relative">
                          <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#fc8019] focus:ring-1 focus:ring-[#fc8019] transition-all"
                            placeholder="restaurant@example.com"
                          />
                          <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                       </div>
                    </div>

                    <div>
                       <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs font-bold text-gray-700 uppercase">Password</label>
                          <a href="#" className="text-xs text-[#fc8019] font-bold hover:underline">Forgot?</a>
                       </div>
                       <div className="relative">
                          <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#fc8019] focus:ring-1 focus:ring-[#fc8019] transition-all"
                            placeholder="••••••••"
                          />
                          <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                       </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-[#fc8019] text-white font-bold py-3.5 rounded-lg hover:bg-[#e66f0f] transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                      {loading ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : "Login to Dashboard"}
                    </button>
                 </form>

                 <div className="mt-6 text-center text-sm text-gray-500">
                    Don't have a partner account? <Link to="/partner/register" className="text-[#fc8019] font-bold hover:underline">Register now</Link>
                 </div>
              </div>
           </div>
           
           <p className="text-center text-gray-500 text-xs mt-8">
              © 2024 FoodWagon Partner Center. <br/>By logging in, you agree to our Terms of Service.
           </p>
        </div>
      </div>
    </div>
  );
};

export default PartnerLogin;