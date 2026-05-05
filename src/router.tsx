console.log("ROUTER MODULE LOADING AT " + new Date().toISOString());
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  return createRouter({
    routeTree,
  });
};