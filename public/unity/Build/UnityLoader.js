// Unity WebGL Loader Stub
// This file redirects to the actual Unity loader
(function() {
  'use strict';
  
  // Check if the actual Unity loader is already loaded
  if (typeof window.createUnityInstance !== 'undefined') {
    return;
  }
  
  // Load the actual Unity loader
  var script = document.createElement('script');
  script.src = '/unity/76485bb6de948dcda80ca8ec0ddab156.loader.js';
  script.onload = function() {
    console.log('Unity loader successfully loaded');
  };
  script.onerror = function() {
    console.error('Failed to load Unity loader');
  };
  
  document.head.appendChild(script);
})();