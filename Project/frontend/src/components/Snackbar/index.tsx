// CustomizedSnackbars.js
import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

function CustomizedSnackbars({ open, handleClick, handleClose }) {
  return (
    <div>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleClose}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Success!
        </Alert>
      </Snackbar>
    </div>
  );
}

export default CustomizedSnackbars;
