import {
  BrowserRouter as Router,
  Link as NavLink,
  Route,
  Routes,
} from 'react-router-dom';
import {
  AppBar,
  createTheme,
  CssBaseline,
  ThemeProvider,
  Toolbar,
  Typography,
} from '@mui/material';

import logo from '../../assets/team-logo.png';
import Graph from '../Graph/index_visjs';
import UploadPage from '../UploadPage';
import LandingPage from '../LandingPage';

import './index.css';

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
        <div className='Appcontainer'>
          <AppBar position="sticky" className="appBar">
            <Toolbar
              className="toolbar"
              sx={{ background: (theme) => theme.palette.background.default }}
            >
              <NavLink to="/">
              <img src={logo} alt="Logo" className="logo" />
              </NavLink>
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
        
        <main className="main_wrapper">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/graph/:fileId" element={<Graph />} />
          </Routes>
        </main>
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;
