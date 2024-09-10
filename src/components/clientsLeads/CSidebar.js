import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './clientSidebar.css'; // Import the CSS file for Sidebar

const CSidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      
      <nav>
        <ul>
          <li className="sidebar-greeting1">Welcome User,</li>
          <li className="sidebar-greeting">Leads</li>
          <li className={`sidebar-link ${location.pathname === '/call-leads' ? 'active' : ''}`}>
  <Link to="/call-leads">All Leads</Link>
</li>

<li className={`sidebar-link ${location.pathname === '/requirementShared' ? 'active' : ''}`}>
  <Link to="/requirementShared">Requirement Share</Link>
</li>

<li className={`sidebar-link ${location.pathname === '/interested' ? 'active' : ''}`}>
          <Link to="/interested">Interested</Link>
        </li>
        <li className={`sidebar-link ${location.pathname === '/noninterested' ? 'active' : ''}`}>
          <Link to="/noninterested">Not Interested</Link>
        </li>
         
        </ul>
      </nav>
    </div>
  );
};

export default CSidebar;
