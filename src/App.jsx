import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Forgot from "./dashboard/Forgot";
import Signup from "./dashboard/Signup";
import Login from "./dashboard/Login";
import Homes from "./homes/Homes";
import Categries from "./categries/Categries";
import MobileProducts from "./homes/MobileProducts";
import SportShoes from "./homes/SportShoes";
import Electronic from "./homes/Electronic";
import Acessories from "./homes/Acessories";
import Faction from "./homes/Faction";
import Kitchen from "./homes/Kitchen"; 
import Yourcart from "./homes/Yourcart";
import Yoursoredr from "./homes/Yoursoredr";
import AdminDashboard from "./admin/AdminDashboard";
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Homes />} />
        <Route path="/categories" element={<Categries />} />
        <Route path="/categories/mobile" element={<MobileProducts />} />
        <Route path="/categories/sport-shoes" element={<SportShoes />} />
        <Route path="/categories/faction" element={<Faction />} /> {/* Fixed 'elemant' typo */}
        <Route path="/categories/accessories" element={<Acessories />} />
        <Route path="/categories/electronic" element={<Electronic />} />
        <Route path="/categories/kitchen" element={<Kitchen />} /> {/* Fixed lowercase 'route' typo */}
        <Route path="/yourcart" element={<Yourcart />} />
        <Route path="/yourorders" element={<Yoursoredr />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/forgot" element={<Forgot />} />
      </Routes>
    </Router>
  );
}