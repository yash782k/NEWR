import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../../firebaseConfig'; // Firebase configuration import
import CSidebar from './CSidebar'; // Adjust path as needed
import ClientHeader from './ClientHeader'; // Adjust path as needed
import './callLeads.css'; // Your CSS styling

const CallLeads = () => {
  const [leads, setLeads] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const leadsCollection = collection(db, 'clientleads');
        const leadsSnapshot = await getDocs(leadsCollection);
        const leadsList = leadsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLeads(leadsList);
      } catch (error) {
        console.error('Error fetching leads:', error);
      }
    };

    fetchLeads();
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <CSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      <div className="dashboard-content">
        <ClientHeader onMenuClick={handleSidebarToggle} isSidebarOpen={sidebarOpen} />
        <h2>Call Leads</h2>
        <table>
          <thead>
            <tr>
              <th>Lead Name</th>
              <th>Mobile No</th>
              <th>Requirement</th>
              <th>From Date</th>
              <th>To Date</th>
              <th>Source</th>
              <th>Status</th>
              <th>Budget</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.leadName}</td>
                <td>{lead.mobileNo}</td>
                <td>{lead.requirement}</td>
                <td>{lead.fromDate}</td>
                <td>{lead.toDate}</td>
                <td>{lead.source}</td>
                <td>{lead.status}</td>
                <td>{lead.budget}</td>
                <td>
                  <Link to={`/calledit/${lead.id}`}>
                    <button>Edit</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CallLeads;
