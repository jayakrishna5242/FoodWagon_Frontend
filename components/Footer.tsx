import React from 'react';
import { Utensils, Github, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#171a29] text-gray-400 py-14 mt-16">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary p-2 rounded-xl">
                <Utensils className="text-white w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-white">FoodWagon</span>
            </div>
            <p className="text-sm leading-relaxed">
              FoodWagon is a full-stack food delivery application built as a
              learning and portfolio project.
            </p>
          </div>

          {/* Pages */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Pages</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/restaurants" className="hover:text-white transition-colors">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Orders
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Tech Stack</h3>
            <ul className="space-y-2 text-sm">
              <li>React + TypeScript</li>
              <li>Tailwind CSS</li>
              <li>Spring Boot</li>
              <li>JWT Authentication</li>
              <li>MySQL</li>
            </ul>
          </div>

          {/* Developer */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Developer</h3>
            <p className="text-sm mb-4">
              Built by <span className="text-white font-medium">Jayakrishna</span>
            </p>

            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">
                <Github size={18} />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} FoodWagon — Educational & Portfolio Project  
          <br />
          Not affiliated with Swiggy, Zomato, or any real food delivery platform.
        </div>

      </div>
    </footer>
  );
};

export default Footer;
