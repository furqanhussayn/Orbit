import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HomeFeed from "./pages/HomeFeed";
import Spaces from "./pages/Spaces";
import SpaceDetail from "./pages/SpaceDetail";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import NotFound from "./pages/NotFound";
import Explore from "./pages/Explore";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/home" element={
                <ProtectedRoute>
                  <HomeFeed />
                </ProtectedRoute>
              } />
              <Route path="/spaces" element={
                <ProtectedRoute>
                  <Spaces />
                </ProtectedRoute>
              } />
              <Route path="/space/:id" element={
                <ProtectedRoute>
                  <SpaceDetail />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/profile/:userId" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/create" element={
                <ProtectedRoute>
                  <CreatePost />
                </ProtectedRoute>
              } />
              <Route path="/trending" element={
                <ProtectedRoute>
                  <HomeFeed />
                </ProtectedRoute>
              } />
              <Route path="/explore" element={
                <ProtectedRoute>
                  <Explore />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
