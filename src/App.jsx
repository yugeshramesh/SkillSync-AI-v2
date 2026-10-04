import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Loading from "./pages/Loading";
import TopMatches from "./pages/TopMatches";
import Match from "./pages/Match";
import Chat from "./pages/Chat";
import Connected from "./pages/Connected";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/topmatches" element={<TopMatches />} />
        <Route path="/match" element={<Match />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/connected" element={<Connected />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
