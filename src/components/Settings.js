import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const [peers, setPeers] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    try {
      setPeers(localStorage.getItem('preferredPeers') || '');
    } catch (e) {
      setPeers('');
    }
  }, []);

  const save = () => {
    try {
      localStorage.setItem('preferredPeers', peers);
    } catch (e) {
      // ignore
    }
    navigate(-1);
  };

  return (
    <Box sx={{ p: 2 }}>
      <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
      <Typography variant="h6">Settings</Typography>
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 640 }}>
        <TextField label="Preferred peers (comma-separated)" value={peers} onChange={(e) => setPeers(e.target.value)} helperText="e.g. http://localhost:8765/gun" />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" onClick={save}>Save</Button>
          <Button variant="outlined" onClick={() => { setPeers(''); localStorage.removeItem('preferredPeers'); }}>Clear</Button>
        </Box>
      </Box>
    </Box>
  );
}
