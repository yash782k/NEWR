import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './clientsLeads.css';
import CSidebar from './CSidebar'; // Import the CSidebar component
import ClientHeader from './ClientHeader'; // Import the ClientHeader component

const ClientLeads = () => {
  const [formData, setFormData] = useState({
    leadName: '', 
    mobileNo: '',
    requirement: '',
    fromDate: '',
    toDate: '',
    source: 'google',
    stage: 'fresh lead',
    budget: '', // New field
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleCreateClientLead = async (e) => {
    e.preventDefault();

    const { leadName, mobileNo, requirement, fromDate, toDate, source, stage, budget } = formData;

    const today = new Date().toISOString().split('T')[0];
    if (new Date(toDate) < new Date(today)) {
      toast.error('To Date cannot be in the past.');
      return;
    }

    try {
      await addDoc(collection(db, 'clientleads'), {
        leadName,
        mobileNo,
        requirement,
        fromDate,
        toDate,
        source,
        stage,
        budget, // Include new field
      });

      toast.success('Client lead created successfully.');
      setTimeout(() => {
        navigate('/clientleads');
      }, 1500);
    } catch (error) {
      toast.error('Failed to create client lead. Please try again.');
    }
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <CSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      <div className="dashboard-content">
        <ClientHeader onMenuClick={handleSidebarToggle} isSidebarOpen={sidebarOpen} />
        <h2>Add A Client Lead</h2>
        <form onSubmit={handleCreateClientLead}>
          <div className="field-row">
            <div>
              <label>Lead Name</label>
              <input 
                type="text" 
                name="leadName" 
                value={formData.leadName} 
                onChange={handleChange} 
                placeholder="Enter Lead Name" 
                required 
              />
            </div>
            <div>
              <label>Mobile No</label>
              <input 
                type="text" 
                name="mobileNo" 
                value={formData.mobileNo} 
                onChange={handleChange} 
                placeholder="Enter Mobile No" 
                required 
              />
            </div>
          </div>
          <div className="field-row">
            <div>
              <label>Requirement</label>
              <input 
                type="text" 
                name="requirement" 
                value={formData.requirement} 
                onChange={handleChange} 
                placeholder="Enter Requirement" 
                required 
              />
            </div>
            <div>
              <label>From Date</label>
              <input 
                type="date" 
                name="fromDate" 
                value={formData.fromDate} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div>
              <label>To Date</label>
              <input 
                type="date" 
                name="toDate" 
                value={formData.toDate} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
          <div className="field-row">
            <div>
              <label>Source</label>
              <select 
                name="source" 
                value={formData.source} 
                onChange={handleChange} 
                required
              >
                <option value="google">Google</option>
                <option value="walk in">Walk In</option>
                <option value="insta">Instagram</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>
            <div>
              <label>Stage</label>
              <select 
                name="stage" 
                value={formData.stage} 
                onChange={handleChange} 
                required
              >
                <option value="fresh lead">Fresh Lead</option>
                <option value="requirement fulfilled">Requirement Fulfilled</option>
                <option value="not interested">Not Interested</option>
                <option value="interested">Interested</option>
              </select>
            </div>
            <div>
              <label>Budget</label> {/* New field */}
              <input 
                type="number" 
                name="budget" 
                value={formData.budget} 
                onChange={handleChange} 
                placeholder="Enter Budget" 
                required 
              />
            </div>
          </div>
          <button type="submit">Create Lead</button>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default ClientLeads;
