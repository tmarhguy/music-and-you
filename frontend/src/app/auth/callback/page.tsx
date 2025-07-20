'use client';

import React, { Suspense, useEffect, useState } from 'react';

function CallbackContent() {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Completing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          console.error('OAuth error:', error);
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          setTimeout(() => {
            window.location.href = '/?error=' + error;
          }, 3000);
          return;
        }

        if (!code || !state) {
          setStatus('error');
          setMessage('Missing authentication parameters');
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
          return;
        }

        // Verify state matches what we stored
        const storedState = localStorage.getItem('spotify_auth_state');
        if (state !== storedState) {
          setStatus('error');
          setMessage('Security verification failed');
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
          return;
        }

        // Exchange code for access token
        setMessage('Exchanging authorization code...');
        const response = await fetch('http://localhost:8000/api/auth/spotify/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Authentication failed');
        }

        const data = await response.json();

        if (data.status === 'success') {
          // Store authentication info
          localStorage.setItem('spotify_user_id', data.user_id);
          localStorage.setItem('spotify_access_token', data.access_token);
          localStorage.setItem('spotifyUser', JSON.stringify(data.user_profile));
          localStorage.removeItem('spotify_auth_state'); // Clean up

          setStatus('success');
          setMessage(`Welcome, ${data.user_profile.display_name || data.user_id}!`);

          // Redirect to home page after success
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          throw new Error('Authentication was not successful');
        }

      } catch (error) {
        console.error('Callback processing failed:', error);
        setStatus('error');
        setMessage(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      case 'success':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-2xl text-green-600">✓</div>
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-2xl text-red-600">✗</div>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'processing':
        return 'Completing Authentication';
      case 'success':
        return 'Authentication Successful!';
      case 'error':
        return 'Authentication Failed';
      default:
        return 'Processing...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center mx-4">
        {getStatusIcon()}
        <h1 className={`text-2xl font-bold mb-2 ${getStatusColor()}`}>
          {getStatusTitle()}
        </h1>
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        {status === 'processing' && (
          <div className="text-sm text-gray-500">
            This may take a few moments...
          </div>
        )}
        {status === 'error' && (
          <div className="text-sm text-gray-500">
            Redirecting you back to the home page...
          </div>
        )}
        {status === 'success' && (
          <div className="text-sm text-gray-500">
            Redirecting you to your dashboard...
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
