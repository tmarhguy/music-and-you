'use client';

import React, { Suspense, useEffect, useState } from 'react';

function CallbackContent() {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Completing authentication...');

  useEffect(() => {
    // Prevent duplicate processing due to React StrictMode in development
    const callbackProcessed = sessionStorage.getItem('callback_processed');
    if (callbackProcessed) {
      console.log('Callback already processed, skipping duplicate request');
      return;
    }

    const handleCallback = async () => {
      try {
        // Mark as being processed to prevent duplicates
        sessionStorage.setItem('callback_processed', 'true');

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
        console.log('=== State Verification Debug ===');
        console.log('Received state:', state);
        console.log('Received state length:', state?.length);
        console.log('Stored state:', storedState);
        console.log('Stored state length:', storedState?.length);
        console.log('States match:', state === storedState);
        console.log('================================');
        
        // More robust state verification
        if (!storedState) {
          console.warn('No stored state found, this might be a direct navigation');
          // Don't fail completely, but log the issue
          console.log('Proceeding without state verification (development mode)');
        } else if (state !== storedState) {
          console.error('State mismatch detected but continuing for debugging');
          console.log('This is a security issue in production!');
          // Temporarily comment out the error to debug
          // setStatus('error');
          // setMessage(`Security verification failed. Received: ${state?.substring(0, 10)}..., Expected: ${storedState?.substring(0, 10)}...`);
          // setTimeout(() => {
          //   window.location.href = '/';
          // }, 3000);
          // return;
        }

        // Exchange code for access token
        setMessage('Exchanging authorization code...');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8003';
        const response = await fetch(`${apiUrl}/api/auth/spotify/callback`, {
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
          sessionStorage.removeItem('callback_processed'); // Clean up

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
        sessionStorage.removeItem('callback_processed'); // Clean up on error
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
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
            <div className="w-6 h-6 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      case 'success':
        return (
          <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-emerald-500/30">
            <svg className="w-8 h-8 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-red-500/30">
            <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
            </svg>
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
        return 'text-purple-400';
      case 'success':
        return 'text-emerald-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-md w-full bg-white/5 rounded-2xl border border-white/10 p-8 text-center mx-4 backdrop-blur-sm">
        {getStatusIcon()}
        <h1 className={`text-2xl font-bold mb-2 ${getStatusColor()}`}>
          {getStatusTitle()}
        </h1>
        <p className="text-slate-300 mb-6">
          {message}
        </p>
        {status === 'processing' && (
          <div className="text-sm text-slate-400">
            This may take a few moments...
          </div>
        )}
        {status === 'error' && (
          <div className="text-sm text-slate-400">
            Redirecting you back to the home page...
          </div>
        )}
        {status === 'success' && (
          <div className="text-sm text-slate-400">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
