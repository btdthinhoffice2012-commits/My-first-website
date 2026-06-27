// Vercel Speed Insights Integration
// This file integrates Vercel Speed Insights for tracking web vitals
// Documentation: https://vercel.com/docs/speed-insights

(function() {
  'use strict';
  
  // Initialize the Speed Insights queue
  if (typeof window.si !== 'undefined') return;
  
  window.si = function() {
    (window.siq = window.siq || []).push(arguments);
  };
  
  // Inject the Speed Insights script
  // Note: The script URL will be automatically provided by Vercel after enabling 
  // Speed Insights in your project dashboard
  // For now, this sets up the client-side queue that will collect metrics
  // Once deployed to Vercel with Speed Insights enabled, the actual tracking script
  // will be injected automatically at: /_vercel/speed-insights/script.js
  
  // Mark Speed Insights as initialized
  window.sil = true;
  
  // Only load in production (when deployed to Vercel)
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '') {
    console.log('[Speed Insights] Running in development mode - tracking disabled');
    return;
  }
  
  // Load the Speed Insights script from Vercel's CDN
  // This will be automatically served by Vercel when Speed Insights is enabled
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/speed-insights/script.js';
  script.onerror = function() {
    console.warn('[Speed Insights] Failed to load. Make sure Speed Insights is enabled in your Vercel project settings.');
  };
  
  // Insert the script
  if (document.head) {
    document.head.appendChild(script);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      document.head.appendChild(script);
    });
  }
})();
