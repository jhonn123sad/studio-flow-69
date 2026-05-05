import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  component: () => {
    return (
      <div style={{ pointerEvents: 'auto', backgroundColor: 'cyan', height: '100%' }}>
        <Outlet />
      </div>
    );
  },
});
