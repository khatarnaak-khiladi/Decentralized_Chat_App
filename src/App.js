import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./components/MainPage";
import ChatWindow from "./components/ChatWindow";
import DecentralizedChat from "./components/DecentralizedChat";
import Settings from "./components/Settings";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/chat/:id" element={<ChatWindow />} />
        <Route path="/p2p" element={<DecentralizedChat />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
