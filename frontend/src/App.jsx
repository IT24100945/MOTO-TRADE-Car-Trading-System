import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SellerDashboard from './pages/SellerDashboard';
import AddVehicle from './pages/AddVehicle';
import EditVehicle from './pages/EditVehicle';
import VehicleDetails from './pages/VehicleDetails';
import Compare from './pages/Compare';
import PrivateRoute from './components/PrivateRoute';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="app">
                    <Navbar />
                    <main className="container p-4">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/vehicle/:id" element={<VehicleDetails />} />
                            <Route path="/compare" element={<Compare />} />

                            <Route path="/dashboard" element={
                                <PrivateRoute role="Seller">
                                    <SellerDashboard />
                                </PrivateRoute>
                            } />
                            <Route path="/dashboard/add-vehicle" element={
                                <PrivateRoute role="Seller">
                                    <AddVehicle />
                                </PrivateRoute>
                            } />
                            <Route path="/dashboard/edit-vehicle/:id" element={
                                <PrivateRoute role="Seller">
                                    <EditVehicle />
                                </PrivateRoute>
                            } />

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
