import { Route, Routes } from "react-router";
import HomePage from "./Pages/HomePage";
import SignupPage from "./Pages/SignupPage";
import LoginPage from "./Pages/LoginPage";
import NotificationPage from "./Pages/NotificationPage";
import OnboardingPage from "./Pages/OnboardingPage";
import ChatPage from "./Pages/ChatPage";
import CallPage from "./Pages/CallPage";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/notification" element={<NotificationPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/call" element={<CallPage />} />
      </Routes>
    </div>
  );
}

export default App;
