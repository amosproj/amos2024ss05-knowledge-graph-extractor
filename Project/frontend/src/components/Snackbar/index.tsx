// CustomizedSnackbars.tsx
import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { messageSeverity } from '../../constant';

interface CustomizedSnackbarsProps {
  open: boolean;
  handleClick: () => void;
  handleClose: (event?: React.SyntheticEvent | Event, reason?: string) => void;
  severity_value?: messageSeverity;
  message?: string;
}

const CustomizedSnackbars: React.FC<CustomizedSnackbarsProps> = ({
  open,
  handleClick,
  handleClose,
  message = 'Success!',
  severity_value = messageSeverity.SUCCESS,
}) => {
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
          severity={severity_value}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CustomizedSnackbars;
