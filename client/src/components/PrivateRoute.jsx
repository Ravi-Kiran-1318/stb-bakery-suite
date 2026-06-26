import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loader from './Loader';

const PrivateRoute = ({ children, role }) => {
  // BYPASS FOR DEMO
  return children;
};

export default PrivateRoute;
