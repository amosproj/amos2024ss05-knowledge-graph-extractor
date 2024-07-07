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
  Divider,
  Paper,
  Stack,
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
        <Stack direction="column" flex={1}>
          <Paper
            variant="elevation"
            elevation={0.7}
            component={Stack}
            display={'flex'}
            flexDirection={'row'}
            alignItems={'center'}
            justifyContent={'space-between'}
            px={2}
            py={1}
          >
            <NavLink to="/">
              <img src={logo} alt="Logo" className="logo" />
            </NavLink>
            <Typography variant="h6">Graph Masters</Typography>
            <NavLink to="/" style={{ textDecoration: 'none' }}>
              <Typography variant="h6" sx={{ color: 'white' }}>
                Home
              </Typography>
            </NavLink>
          </Paper>

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/graph/:fileId" element={<Graph />} />
          </Routes>
        </Stack>
      </ThemeProvider>
    </Router>
  );
}

export default App;
