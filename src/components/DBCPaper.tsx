import React from 'react';
import { Paper, PaperProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  borderRadius: theme.spacing(2),
  width: '90%',
  marginLeft: 'auto',
  marginRight: 'auto',
  marginBottom: theme.spacing(4),
}));

const DBCPaper: React.FC<PaperProps> = (props) => {
  return <StyledPaper elevation={8} {...props} />;
};

export default DBCPaper;
