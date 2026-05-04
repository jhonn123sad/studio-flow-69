import { createRouter, createRoute, createRootRoute } from "@tanstack/react-router";
import { Route as rootRoute } from "./routes/__root";
import { Route as loginRoute } from "./routes/login";

// Manually define a minimal route tree
const routeTree = rootRoute.addChildren([loginRoute]);

export const getRouter = () => {
  return createRouter({
    routeTree,
    context: {},
  });
};