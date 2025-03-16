import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import LoadingScreen from './LoadingScreen';

const PrivateRoute = ({ children }) => {
  const { authenticated, loading } = useContext(AppContext);

  if (loading) {
    return <LoadingScreen />;
  }

  return authenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;