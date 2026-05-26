import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Fab,
  useMediaQuery,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme, ThemeProvider, createTheme } from "@mui/material/styles";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import HubIcon from "@mui/icons-material/Hub";
import "@fontsource/rationale";
import "@fontsource/orbitron";
import FormModal from "./FormModal"; // Make sure FormModal is implemented!
import { Filesystem, Directory } from "@capacitor/filesystem";
import SettingsIcon from "@mui/icons-material/Settings";

function MainPage() {
  const [contacts, setContacts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const initialThemeMode = location.state?.themeMode || "light";
  const [themeMode, setThemeMode] = useState(initialThemeMode);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create dynamic theme based on mode
  const theme = createTheme({
    palette: {
      mode: themeMode,
    },
  });

  // Load contacts from directory
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const contactsDir = await Filesystem.readdir({
          path: "contacts",
          directory: Directory.Documents,
        });

        const loadedContacts = await Promise.all(
          contactsDir.files.map(async (contactFile) => {
            const contactName = contactFile.name; // Access only 'name' here

            let profilePicture = "/default-avatar.png"; // Fallback

            try {
              const profilePicPath = `contacts/${contactName}/profile_picture.png`;
              const profilePicResult = await Filesystem.readFile({
                path: profilePicPath,
                directory: Directory.Documents,
              });
              profilePicture = `data:image/jpeg;base64,${profilePicResult.data}`;
            } catch (error) {
              console.warn(
                `Couldn't load profile picture for ${contactName}, using default.`,
              );
            }

            return {
              name: contactName,
              profilePicture,
            };
          }),
        );
        setContacts(loadedContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchContacts();
  }, []);

  const handleContactClick = (contact) => {
    navigate(`/chat/${contact.name}`, {
      state: { contact, themeMode },
    });
  };

  const toggleTheme = () => {
    setThemeMode((prevThemeMode) =>
      prevThemeMode === "light" ? "dark" : "light",
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          backgroundColor: (theme) => theme.palette.background.default,
          color: (theme) => (theme.palette.mode === "dark" ? "#000" : "#fff"),
          transition: "background-color 0.3s, color 0.3s",
        }}
      >
        {/* Top Bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            padding: isMobile ? "8px" : "10px",
            backgroundColor: (theme) => theme.palette.background.paper,
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 0 15px 5px rgba(100, 130, 100, 0.2)"
                : "0 0 15px 5px rgba(0, 0, 0, 0.2)",
            flexShrink: 0,
            color: (theme) => (theme.palette.mode === "dark" ? "#000" : "#fff"),
          }}
        >
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon
              sx={{
                color: (theme) => theme.palette.text.primary,
                textShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 0 8px rgba(255, 255, 255, 0.6)"
                    : "0 0 8px rgba(0, 0, 0, 0.3)",
                fontSize: isMobile ? "25px" : "32px",
              }}
            />
          </IconButton>

          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            sx={{
              textAlign: "center",
              flexGrow: 1,
              color: (theme) =>
                theme.palette.mode === "dark" ? "#2ecc71" : "#48c774",
              textShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 0 18px rgba(72, 199, 116, 1)"
                  : "0 0 18px rgba(72, 199, 116, 0.8)",
              fontWeight: "bold",
              fontFamily: "'Orbitron'",
              letterSpacing: "0.1em",
              fontSize: 22,
            }}
          >
            Recon
          </Typography>

          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.7 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Fab
              size="small"
              onClick={toggleTheme}
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "#4caf50" : "#ffb74d",
                color: (theme) =>
                  theme.palette.mode === "dark" ? "#f8f8f8" : "#000",
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0 0 15px 5px rgba(76, 175, 80, 0.35)"
                    : "0 0 15px 5px rgba(255, 183, 77, 0.65)",
                transition: "box-shadow 0.3s",
                "&:hover": {
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "0 0 20px 8px rgba(76, 175, 80, 1)"
                      : "0 0 20px 8px rgba(255, 183, 77, 1)",
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#000" : "#000",
                },
              }}
            >
              {themeMode === "dark" ? <NightsStayIcon /> : <WbSunnyIcon />}
            </Fab>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.7 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Fab
              size="small"
              onClick={() => navigate('/p2p')}
              sx={{
                ml: 1,
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "#90caf9" : "#81d4fa",
                color: (theme) => (theme.palette.mode === "dark" ? "#000" : "#000"),
              }}
            >
              <HubIcon />
            </Fab>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} style={{ marginLeft: 8 }}>
            <Fab size="small" onClick={() => navigate('/settings')} sx={{ backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#b39ddb' : '#ce93d8' }}>
              <SettingsIcon />
            </Fab>
          </motion.div>
        </Box>

        {/* Contact List */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: isMobile ? 1 : 2,
            gap: 1,
          }}
        >
          <List>
            {contacts.map((contact) => (
              <motion.div key={contact.name}>
                <ListItem
                  sx={{
                    fontFamily: "'Orbitron', sans-serif",
                    borderRadius: "16px",
                    marginBottom: "10px",
                    padding: isMobile ? "8px" : "12px",
                    boxShadow: (theme) =>
                      theme.palette.mode === "dark"
                        ? "0px 4px 14px rgba(0, 255, 255, 0.1)"
                        : "0px 4px 14px rgba(0, 0, 0, 0.24)",
                    width: "100%",
                    backgroundColor: (theme) => theme.palette.background.paper,
                    "&:hover": {
                      boxShadow: (theme) =>
                        theme.palette.mode === "dark"
                          ? "0px 6px 20px rgba(0, 255, 255, 0.2)"
                          : "0px 6px 20px rgba(0, 0, 0, 0.29)",
                    },
                  }}
                  onClick={() => handleContactClick(contact)}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        fontFamily: "'Orbitron', sans-serif",
                        boxShadow: (theme) =>
                          theme.palette.mode === "dark"
                            ? "0 0 10px rgba(100, 200, 255, 0.5)"
                            : "0 0 10px rgba(0, 0, 0, 0.2)",
                      }}
                      src={contact.profilePicture}
                      alt={contact.name}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={contact.name}
                    sx={{
                      fontFamily: "'Orbitron', sans-serif",
                      color: (theme) => theme.palette.text.primary,
                    }}
                  />
                  <IconButton edge="end">
                    <EditIcon />
                  </IconButton>
                </ListItem>
              </motion.div>
            ))}
          </List>
        </Box>

        {/* Add Contact Button */}
        <Box>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{ position: "fixed", bottom: "20px", right: "20px" }}
          >
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => setIsModalOpen(true)} // Open the modal
            >
              <AddIcon />
            </Fab>
          </motion.div>
        </Box>

        {/* Form Modal */}
        {isModalOpen && (
          <FormModal
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default MainPage;
