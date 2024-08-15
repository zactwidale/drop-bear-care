import { useEffect } from 'react';

export function useTabManagement() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return; // Exit if not in browser environment
    }

    const tabId = Math.random().toString(36).substring(2, 15);

    const setActiveTab = () => {
      localStorage.setItem('activeTab', tabId);
    };

    const checkActiveTab = () => {
      const activeTab = localStorage.getItem('activeTab');
      if (activeTab && activeTab !== tabId) {
        alert(
          'This application is already open in another tab. Please use that tab to ensure consistent behavior.'
        );
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setActiveTab();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const intervalId = setInterval(checkActiveTab, 5000);

    setActiveTab();
    checkActiveTab();

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (localStorage.getItem('activeTab') === tabId) {
        localStorage.removeItem('activeTab');
      }
    };
  }, []);
}
