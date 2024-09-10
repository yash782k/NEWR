import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import CSidebar from './CSidebar'; // Import the CSidebar component
import ClientHeader from './ClientHeader'; // Import the ClientHeader component
import './requirementShared.css'; // CSS for styling the component

const RequirementShared = () => {
  const [leads, setLeads] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch leads whose stage is 'requirement fulfilled'
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const q = query(collection(db, 'clientleads'), where('stage', '==', 'requirement fulfilled'));
        const querySnapshot = await getDocs(q);
        const leadsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setLeads(leadsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leads:', error);
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  // Function to handle stage update
  const handleStageChange = async (leadId, newStage) => {
    try {
      const leadRef = doc(db, 'clientleads', leadId);
      await updateDoc(leadRef, { stage: newStage });
      // After updating Firestore, update the local state
      setLeads((prevLeads) => 
        prevLeads.map((lead) => 
          lead.id === leadId ? { ...lead, stage: newStage } : lead
        )
      );
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  // Toggle sidebar
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <CSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      <div className="dashboard-content">
        <ClientHeader onMenuClick={handleSidebarToggle} isSidebarOpen={sidebarOpen} />
        <h2>Requirement Fulfilled Leads</h2>

        {loading ? (
          <p>Loading leads...</p>
        ) : leads.length > 0 ? (
          <table className="leads-table">
            <thead>
              <tr>
                <th>Lead Name</th>
                <th>Mobile No</th>
                <th>Requirement</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Source</th>
                <th>Budget</th>
                <th>Stage</th>
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
                  <td>{lead.budget}</td>
                  <td>{lead.stage}</td>
                  <td>
                    
                    <Link to={`/calledit/${lead.id}`}>
                      <button>Edit</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No leads found with 'requirement fulfilled' status.</p>
        )}
      </div>
    </div>
  );
};

export default RequirementShared;
