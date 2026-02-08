import { NavLink, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import CardsPage from "../pages/CardsPage";
import InputPage from "../pages/InputPage";

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    padding: "8px 12px",
    borderRadius: 8,
    textDecoration: "none",
    color: "inherit",
    background: isActive ? "rgba(0,0,0,0.08)" : "transparent",
});

export default function App() {
    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
            <header style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
                <NavLink to="/" style={linkStyle} end>
                    Home
                </NavLink>
                <NavLink to="/cards" style={linkStyle}>
                    Cards
                </NavLink>
                <NavLink to="/input" style={linkStyle}>
                    Input
                </NavLink>
            </header>

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/cards" element={<CardsPage />} />
                <Route path="/input" element={<InputPage />} />
            </Routes>
        </div>
    );
}
