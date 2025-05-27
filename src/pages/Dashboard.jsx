// src/pages/Dashboard.jsx
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
      {user && (
        <div className="mt-4">
          <p>Hello, {user.firstName} {user.lastName}</p>
          <p>Email: {user.email}</p>
          <p>Phone: {user.phoneNumber}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;