import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { StrictMode } from "react";
import { makeServer } from "./mirage/server";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

makeServer();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
