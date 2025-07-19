'use client';

import React, { Suspense, useEffect } from 'react';

function CallbackContent() {
  useEffect(() => {
    // Handle OAuth callback logic here
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      window.location.href = '/?error=' + error;
      return;
    }

    if (code) {
      console.log('Authorization code received:', code);
      // TODO: Handle authentication with backend
      // For now, just redirect to home
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } else {
      window.location.href = '/';
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Completing Authentication
        </h1>
        <p className="text-gray-600 mb-6">
          Please wait while we set up your account...
        </p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
