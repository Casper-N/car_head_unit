import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Home from "./screens/Home";
import Settings from "./screens/Settings";
import Music from "./screens/Music";
import Topbar from "./components/bars/Topbar";
import Bottombar from "./components/bars/Bottombar";
import Bluetooth from "./screens/Bluetooth";
import Navigation from "./screens/Navigation";
import Radio from "./screens/Radio";
import InternetRadio from "./screens/InternetRadio";
import BoardManager from "./screens/BoardManager";
import { NotificationProvider } from "./components/notifications/Notification";
import BoardDetails from "./components/boards/BoardDetails";
import Updates from "./components/settings/Updates";

function App() {
  return (
    <Router>
      <NotificationProvider>
        <Topbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/music" element={<Music />} />
          <Route path="/bluetooth" element={<Bluetooth />} />
          <Route path="/navigation" element={<Navigation />} />
          <Route path="/radio" element={<Radio />} />
          <Route path="/internet_radio" element={<InternetRadio />} />
          <Route path="/boards" element={<BoardManager />} />
          <Route path="/board/:id" element={<BoardDetails />} />

          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/updates" element={<Updates />} />
        </Routes>
        <Bottombar />
      </NotificationProvider>
    </Router>
  );
}

export default App;
