import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link as NavLink,
} from "react-router-dom";
import { AppBar, Toolbar, Typography, CssBaseline, ThemeProvider, createTheme } from '@mui/material';

import logo from "../../assets/team-logo.png";
import Home from "../Home";
import Graph from "../Graph";
import LandingPage from "../LandingPage";

import "./index.css";

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div>
          <AppBar position="sticky" className="appBar">
            <Toolbar className="toolbar" sx={{ background: theme => theme.palette.background.default }}>
              <img src={logo} alt="Logo" className="logo" />
              <Typography variant="h6" className="title">
                Graph Masters
              </Typography>
              <NavLink to="/" className="nav_link_item">
                <Typography variant="h6" className="title">
                  Home
                </Typography>
              </NavLink>
            </Toolbar>
          </AppBar>
        </div>
        <main className="main_wrapper">
          <Routes>
            <Route
              path="/"
              element={<LandingPage />}
            />
            <Route
              path="/upload"
              element={<Home />}
            />
            <Route
              path="/graph/:fileId"
              element={<Graph />}
            />
          </Routes>
        </main>
      </ThemeProvider>
    </Router>
  );
}

export default App;
