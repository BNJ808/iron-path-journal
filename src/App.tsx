
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import WorkoutPage from "./pages/WorkoutPage";
import StatsPage from "./pages/StatsPage";
import HistoryPage from "./pages/HistoryPage";
import TimerPage from "./pages/TimerPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/workout" replace />} />
            <Route path="/workout" element={<WorkoutPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/timer" element={<TimerPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
