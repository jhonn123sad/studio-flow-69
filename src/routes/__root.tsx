import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  useEffect(() => {
    console.log('[CLICK TEST] Root montado com Outlet');
  }, []);

  return (
    <div 
      style={{ 
        height: '100vh', 
        width: '100vw',
        backgroundColor: '#eee',
        pointerEvents: 'auto'
      }}
    >
      <Outlet />
    </div>
  );
}
