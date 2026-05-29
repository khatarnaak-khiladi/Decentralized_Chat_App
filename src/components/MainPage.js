import React from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        background: "linear-gradient(180deg, #071b2d 0%, #0f2d45 45%, #122d3d 100%)",
      }}
    >
      <Paper
        elevation={16}
        sx={{
          width: "100%",
          maxWidth: 760,
          borderRadius: 4,
          p: { xs: 4, sm: 6 },
          background: "rgba(10, 24, 46, 0.92)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            letterSpacing: "0.12em",
            mb: 2,
            color: "#74c0fc",
          }}
        >
          Recon Secure Chat
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: 4,
            color: "rgba(255,255,255,0.8)",
            lineHeight: 1.8,
          }}
        >
          Create a private room or join an existing one with a secret code. Messages are encrypted,
          timestamped, and deduplicated so your chat stays clean and simple.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate("/p2p")}
            sx={{ flex: 1, minHeight: 56, fontWeight: 700 }}
          >
            Open Secure Chat
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            onClick={() => navigate("/settings")}
            sx={{ flex: 1, minHeight: 56, borderColor: "rgba(255,255,255,0.2)", color: "#fff" }}
          >
            Settings
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
