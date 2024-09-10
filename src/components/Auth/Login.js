import React, { useState, useEffect } from 'react';
import { Button, Checkbox, TextField, IconButton, InputAdornment } from '@mui/material';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext'; // Import the context
import { Visibility, VisibilityOff } from '@mui/icons-material';
import './login.css';
import Logo from '../../assets/logo.png';
import BgAbstract from '../../assets/sd.jpg';
import { fetchRealTimeDate } from '../../utils/fetchRealTimeDate';

const Login = () => {
  const { setUserData } = useUser(); // Access setUserData from the context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthToken = async () => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (token) {
        try {
          const auth = getAuth();
          const user = await auth.verifyIdToken(token);
          if (user) {
            setUserData({ name: user.name, role: user.role, email: user.email });
            navigate(user.role === 'Super Admin' ? '/leads' : '/welcome');
          }
        } catch (error) {
          console.error('Token validation error:', error);
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
        }
      }
    };
    checkAuthToken();
  }, [setUserData, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const auth = getAuth();

    try {
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user token
      const token = await user.getIdToken();

      // Handle token storage
      if (rememberMe) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userEmail', JSON.stringify(email));
      } else {
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('userEmail', JSON.stringify(email));
      }

      // Check if the user is a Super Admin
      const superAdminQuery = query(collection(db, 'superadmins'), where('email', '==', email));
      const superAdminSnapshot = await getDocs(superAdminQuery);

      if (!superAdminSnapshot.empty) {
        const superAdminData = superAdminSnapshot.docs[0].data();
        setUserData({ name: superAdminData.name, role: 'Super Admin', email });
        navigate('/leads');
        return;
      }

      // Check if the user is an Admin
      const adminQuery = query(collection(db, 'admins'), where('email', '==', email));
      const adminSnapshot = await getDocs(adminQuery);

      if (!adminSnapshot.empty) {
        const adminData = adminSnapshot.docs[0].data();
        if (adminData.firstLogin) {
          await updateDoc(doc(db, 'admins', adminSnapshot.docs[0].id), { firstLogin: false });
          navigate('/change-password'); // Redirect to ChangePassword if it's the first login
          return;
        }
        setUserData({ name: adminData.name, role: 'Admin', email });
        navigate('/leads');
        return;
      }

      // Check if the user is a Branch Manager
      const branchQuery = query(collection(db, 'branches'), where('emailId', '==', email));
      const branchSnapshot = await getDocs(branchQuery);

      if (!branchSnapshot.empty) {
        const branchData = branchSnapshot.docs[0].data();
        const today = await fetchRealTimeDate(); // Fetch real-time date

        const activeDate = new Date(branchData.activeDate);
        const deactiveDate = new Date(branchData.deactiveDate);

        if (today < activeDate) {
          setError('Plan not active.');
          setLoading(false);
          return;
        }

        if (today > deactiveDate) {
          // Deactivate branch and its subusers
          await updateDoc(doc(db, 'branches', branchSnapshot.docs[0].id), { isActive: false });
          const subusersQuery = query(collection(db, 'subusers'), where('branchCode', '==', branchData.branchCode));
          const subusersSnapshot = await getDocs(subusersQuery);
          for (const doc of subusersSnapshot.docs) {
            await updateDoc(doc.ref, { isActive: false });
          }
          setError('Plan is expired.');
          setLoading(false);
          return;
        }

        // Set user data with branchCode and branchName for branch managers
        setUserData({
          name: branchData.ownerName,
          role: 'Branch Manager',
          email,
          branchCode: branchData.branchCode,
          branchName: branchData.branchName,
        });

        navigate('/welcome');
        return;
      }

      // Check if the user is a Subuser
      const subuserQuery = query(collection(db, 'subusers'), where('email', '==', email));
      const subuserSnapshot = await getDocs(subuserQuery);

      if (!subuserSnapshot.empty) {
        const subuserData = subuserSnapshot.docs[0].data();

        // Check if the branch associated with the subuser is active
        const branchRef = doc(db, 'branches', subuserData.branchCode);
        const branchDoc = await getDoc(branchRef);

        if (!branchDoc.exists()) {
          setError('Branch not found.');
          setLoading(false);
          return;
        }

        const branchData = branchDoc.data();

        if (!branchData.isActive) {
          setError('Branch is not active.');
          setLoading(false);
          return;
        }

        // Check if subuser account is active
        if (!subuserData.isActive) {
          setError('Subuser account is not active.');
          setLoading(false);
          return;
        }

        if (subuserData.firstLogin) {
          await updateDoc(doc(db, 'subusers', subuserSnapshot.docs[0].id), { firstLogin: false });
          navigate('/change-password'); // Redirect to ChangePassword if it's the first login
          return;
        }

        // Set user data for subusers
        setUserData({
          name: subuserData.name,
          role: subuserData.role,
          email,
          branchCode: subuserData.branchCode,
          branchName: subuserData.branchName,
        });

        navigate('/welcome');
        return;
      }

      setError('No user found with the provided credentials.');
    } catch (error) {
      console.error('Login error:', error);

      if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (error.code === 'auth/user-not-found') {
        setError('No user found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <img src={BgAbstract} alt="Background" className="background-image" />

      <div className="logo-container">
        <img src={Logo} alt="Logo" className="logo-image" />
      </div>

      <div className="welcome-text">
        Welcome <br /> Back!
      </div>

      <div className="form-container">
        <div className="title">Sign In</div>
        <div className="subtitle">Welcome back! Please sign in to your account</div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <TextField
              label="Email ID"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
          </div>
          <div className="form-group">
            <TextField
              label="Password"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end" sx={{ background: 'transparent' }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className="remember-me">
            <Checkbox
              checked={rememberMe}
              onChange={() => setRememberMe((prev) => !prev)}
              color="primary"
            />
            <span>Remember Me</span>
          </div>

          <div className="error-message">{error}</div>

          <div className="form-group">
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
              {loading ? 'Loading...' : 'Sign In'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
