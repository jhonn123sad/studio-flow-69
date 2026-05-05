import { Outlet, createRootRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createRootRoute({
  component: () => {
    useEffect(() => {
      console.log('[CLICK TEST] componente raiz montou');
      
      // Forçar pointer-events no root por segurança
      const root = document.getElementById('root');
      if (root) {
        root.style.pointerEvents = 'auto';
        root.style.minHeight = '100vh';
      }
      document.body.style.pointerEvents = 'auto';
      document.documentElement.style.pointerEvents = 'auto';
    }, []);

    return (
      <div id="root-container" style={{ 
        margin: 0, 
        padding: 0, 
        minHeight: '100vh', 
        width: '100%',
        backgroundColor: '#f8fafc', 
        fontFamily: 'sans-serif',
        position: 'relative',
        zIndex: 1,
        pointerEvents: 'auto'
      }}>
        <Outlet />
      </div>
    );
  },
});
