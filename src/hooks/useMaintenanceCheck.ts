import { useEffect } from 'react';

export function useMaintenanceCheck() {
  useEffect(() => {
    // Check for maintenance mode on page load and hash changes
    const checkMaintenanceMode = async () => {
      try {
        // Skip check if we're already on maintenance page or admin/auth
        const currentHash = window.location.hash.slice(1);
        if (currentHash === 'maintenance' || currentHash === 'admin' || currentHash === 'auth') {
          return;
        }

        // Make a simple request to a public API to check if maintenance mode is active
        const response = await fetch('/api/news', {
          credentials: 'include'
        });
        
        if (response.status === 503) {
          const data = await response.text();
          try {
            const parsed = JSON.parse(data);
            if (parsed.maintenanceMode) {
              window.location.hash = 'maintenance';
            }
          } catch (e) {
            // If JSON parsing fails but we got 503, still redirect
            window.location.hash = 'maintenance';
          }
        }
      } catch (error) {
        // If there's an error, don't redirect (might be network issue)
        console.log('Maintenance check failed:', error);
      }
    };

    // Check immediately
    checkMaintenanceMode();

    // Check on hash changes
    const handleHashChange = () => {
      setTimeout(checkMaintenanceMode, 100); // Small delay to ensure page has loaded
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
}