import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Firebase config import

const CallEdit = () => {
  const { id } = useParams(); // Get lead ID from URL params
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    leadName: '',
    mobileNo: '',
    requirement: '',
    fromDate: '',
    toDate: '',
    source: '',
    status: '',
    budget: '',
  });
  const [message, setMessage] = useState(''); // To store success/error message
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const leadDoc = doc(db, 'clientleads', id);
        const leadSnapshot = await getDoc(leadDoc);

        if (leadSnapshot.exists()) {
          const leadData = leadSnapshot.data();
          setLead(leadData);
          setFormData(leadData); // Pre-fill form with current lead data
        }
      } catch (error) {
        console.error('Error fetching lead:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Reset the message on each submit
    try {
      const leadRef = doc(db, 'clientleads', id);
      await updateDoc(leadRef, formData); // Save updated data to Firestore
      setMessage('Changes saved successfully!');
    } catch (error) {
      setMessage('Error saving changes. Please try again.');
      console.error('Error updating lead:', error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Edit Lead</h2>
      {message && <p>{message}</p>} {/* Display the success or error message */}
      <form onSubmit={handleFormSubmit}>
        <label>
          Lead Name:
          <input
            type="text"
            name="leadName"
            value={formData.leadName}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Mobile No:
          <input
            type="text"
            name="mobileNo"
            value={formData.mobileNo}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Requirement:
          <input
            type="text"
            name="requirement"
            value={formData.requirement}
            onChange={handleInputChange}
          />
        </label>
        <label>
          From Date:
          <input
            type="date"
            name="fromDate"
            value={formData.fromDate}
            onChange={handleInputChange}
          />
        </label>
        <label>
          To Date:
          <input
            type="date"
            name="toDate"
            value={formData.toDate}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Source:
          <input
            type="text"
            name="source"
            value={formData.source}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Status:
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
          >
            <option value="Requirement Shared">Requirement Shared</option>
            <option value="Interested">Interested</option>
            <option value="Not Interested">Not Interested</option>
          </select>
        </label>
        <label>
          Budget:
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleInputChange}
          />
        </label>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default CallEdit;
