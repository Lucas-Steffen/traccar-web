import { Box, Tooltip } from '@mui/material';

const FieldTip = ({ title, children }) => (
  <Tooltip title={title} placement="top-start" arrow enterDelay={400}>
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {children}
    </Box>
  </Tooltip>
);

export default FieldTip;
