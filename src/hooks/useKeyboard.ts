import { useEffect } from 'react';

interface KeyboardState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

// Global keyboard state for immediate access
const globalKeys: KeyboardState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
};

// Set up global keyboard listeners once
let listenersSetup = false;

const setupKeyboardListeners = () => {
  if (listenersSetup) return;
  
  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    
    switch (key) {
      case 'w':
      case 'arrowup':
        globalKeys.forward = true;
        break;
      case 's':
      case 'arrowdown':
        globalKeys.backward = true;
        break;
      case 'a':
      case 'arrowleft':
        globalKeys.left = true;
        break;
      case 'd':
      case 'arrowright':
        globalKeys.right = true;
        break;
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    
    switch (key) {
      case 'w':
      case 'arrowup':
        globalKeys.forward = false;
        break;
      case 's':
      case 'arrowdown':
        globalKeys.backward = false;
        break;
      case 'a':
      case 'arrowleft':
        globalKeys.left = false;
        break;
      case 'd':
      case 'arrowright':
        globalKeys.right = false;
        break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  listenersSetup = true;
};

export const useKeyboard = (): KeyboardState => {
  useEffect(() => {
    setupKeyboardListeners();
  }, []);

  return globalKeys;
};