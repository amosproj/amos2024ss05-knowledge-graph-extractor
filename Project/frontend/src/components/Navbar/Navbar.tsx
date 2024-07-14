import React, { useEffect, useState } from 'react';
import { AppBar, Stack, Toolbar, Typography } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '../../assets/team-logo.png';

const Navbar = () => {
  const location = useLocation();
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (location.pathname.startsWith('/graph')) {
      setTitle('Graph Visualization');
    } else {
      switch (location.pathname) {
        case '/':
          setTitle('Home');
          break;
        case '/upload': // todo
          setTitle('Upload');
          break;
        default:
          setTitle('Graph Masters');
      }
    }
  }, [location.pathname]);

  return (
    <AppBar position="fixed" elevation={0.7}>
      <Toolbar>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{ width: '100%' }}
        >
          <NavLink to="/">
            <img
              src={logo}
              alt="Logo"
              className="logo"
              style={{ height: 40 }}
            />
          </NavLink>
          <Typography variant="h6">{title}</Typography>
          <Stack direction="row" spacing={2}>
            <a
              href="https://github.com/amosproj/amos2024ss05-knowledge-graph-extractor/wiki"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Typography variant="h6" sx={{ color: 'white' }}>
                About
              </Typography>
            </a>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
