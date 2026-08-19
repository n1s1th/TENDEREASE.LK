import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
            <p className="text-gray-600">
              Welcome, Administrator! Your dashboard features will be implemented here.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
