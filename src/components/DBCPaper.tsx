import React from 'react';
import { Paper, PaperProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  width: '95%',
  marginLeft: 'auto',
  marginRight: 'auto',
  marginBottom: theme.spacing(4),
}));

const DBCPaper: React.FC<PaperProps> = (props) => {
  return <StyledPaper elevation={8} {...props} />;
};

export default DBCPaper;
