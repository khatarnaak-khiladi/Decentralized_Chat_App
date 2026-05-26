import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  IconButton,
  useMediaQuery,
  Fab,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { motion } from "framer-motion";
import SendIcon from "@mui/icons-material/Send";
import { useTheme, createTheme, ThemeProvider } from "@mui/material/styles";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import { Filesystem, Directory } from "@capacitor/filesystem";

const ChatWindow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Access the theme mode passed from MainPage
  const themeMode = location.state?.themeMode || "light"; // Default to "light" if not passed
  const [currentThemeMode, setCurrentThemeMode] = useState(themeMode);

  // Create a dynamic theme using the toggled themeMode
  const customTheme = createTheme({
    palette: {
      mode: currentThemeMode, // Use currentThemeMode here instead of themeMode
    },
  });

  // Material UI theme for breakpoints
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  useEffect(() => {
    const loadContactData = async () => {
      const contactName = location.state?.contact?.name;
      if (contactName) {
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

        setContact({ ...location.state.contact, profilePicture });
        fetchChatHistory(contactName);
      }
    };

    loadContactData();
  }, [location.state]);

  const toggleTheme = () => {
    setCurrentThemeMode((prevMode) =>
      prevMode === "light" ? "dark" : "light",
    );
  };

  // Function to fetch chat history
  const fetchChatHistory = async (contactName) => {
    try {
      const chatHistoryPath = `contacts/${contactName}/chat_history.json`;
      const result = await Filesystem.readFile({
        path: chatHistoryPath,
        directory: Directory.Documents,
      });
      const chatData = JSON.parse(result.data);
      setChatMessages(chatData);
    } catch (error) {
      console.log("Error fetching chat history or no chat history exists yet.");
    }
  };

  // Function to scroll to the bottom of the chat messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom(); // Scroll to the bottom whenever chatMessages changes
  }, [chatMessages]);

  // Function to send a message
  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    const newMessages = [
      ...chatMessages,
      {
        message: newMessage,
        type: "sent",
        timestamp: new Date().toISOString(),
      },
    ];
    setChatMessages(newMessages);
    setNewMessage(""); // Clear the input field

    // Save the updated messages to the contact's directory
    try {
      const chatHistoryPath = `contacts/${contact.name}/chat_history.json`;
      await Filesystem.writeFile({
        path: chatHistoryPath,
        directory: Directory.Documents,
        data: JSON.stringify(newMessages),
        encoding: "utf8",
      });
    } catch (error) {
      console.log("Error saving chat history:", error);
    }
  };

  if (!contact) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <ThemeProvider theme={customTheme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          backgroundColor: (theme) => theme.palette.background.default,
          color: (theme) => (theme.palette.mode === "dark" ? "#000" : "#fff"),
        }}
      >
        {/* Top Bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            padding: isMobile ? "8px" : "10px",
            backgroundColor: (theme) => theme.palette.background.paper,
            color: (theme) => (theme.palette.mode === "dark" ? "#000" : "#fff"),
            boxShadow:
              currentThemeMode === "dark"
                ? "0 0 15px 5px rgba(100, 130, 100, 0.2)"
                : "0 0 15px 5px rgba(0, 0, 0, 0.2)",
            flexShrink: 0,
          }}
        >
          <IconButton
            onClick={() =>
              navigate("/", { state: { themeMode: currentThemeMode } })
            }
          >
            <ArrowBackIcon
              sx={{
                color: (theme) => theme.palette.text.primary,
                textShadow:
                  currentThemeMode === "dark"
                    ? "0 0 8px rgba(255, 255, 255, 0.6)"
                    : "0 0 8px rgba(0, 0, 0, 0.3)",
                fontSize: isMobile ? "25px" : "32px",
              }}
            />
          </IconButton>
          <Avatar
            src={contact.profilePicture}
            alt={contact.name}
            sx={{
              width: isMobile ? 30 : 40,
              height: isMobile ? 30 : 40,
              ml: 2,
              boxShadow:
                currentThemeMode === "dark"
                  ? "0 0 12px 4px rgba(190, 190, 190, 0.25)"
                  : "0 0 10px 3px rgba(0, 0, 0, 0.25)",
              transition: "box-shadow 0.3s",
              "&:hover": {
                boxShadow:
                  currentThemeMode === "dark"
                    ? "0 0 18px 8px rgba(255, 255, 255, 1)"
                    : "0 0 14px 5px rgba(0, 0, 0, 0.75)",
              },
            }}
          />
          <Typography
            variant={isMobile ? "h6" : "h4"}
            sx={{
              ml: 2,
              flexGrow: 1,
              color: (theme) => theme.palette.text.primary,
              textShadow:
                currentThemeMode === "dark"
                  ? "0 0 10px rgba(255, 255, 255, 0.28)" // Bright glow in dark mode
                  : "0 0 8px rgba(10, 10, 10, 0.28)", // Softer shadow in light mode
              transition: "text-shadow 0.3s",
              fontWeight: "bold", // Make it bold
              fontFamily: "'Orbitron', sans-serif", // Futuristic font from Google Fonts
              letterSpacing: "0.05em", // Slight letter spacing for a more modern feel
            }}
          >
            {contact.name}
          </Typography>

          {/* Theme Toggle Button */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.7 }}>
            <Fab
              size="small"
              onClick={toggleTheme}
              sx={{
                backgroundColor:
                  currentThemeMode === "dark" ? "#4caf50" : "#ffb74d",
                color: currentThemeMode === "dark" ? "#f8f8f8" : "#000",
                boxShadow:
                  currentThemeMode === "dark"
                    ? "0 0 15px 5px rgba(76, 175, 80, 0.35)" // Green glow in dark mode
                    : "0 0 15px 5px rgba(255, 183, 77, 0.65)", // Yellow-orange glow in light mode
                transition: "box-shadow 0.3s",
                "&:hover": {
                  boxShadow:
                    currentThemeMode === "dark"
                      ? "0 0 20px 8px rgba(76, 175, 80, 1)" // Stronger glow on hover
                      : "0 0 20px 8px rgba(255, 183, 77, 1)", // Stronger glow on hover
                  color: currentThemeMode === "dark" ? "#000" : "#000",
                },
              }}
            >
              {currentThemeMode === "dark" ? (
                <NightsStayIcon />
              ) : (
                <WbSunnyIcon />
              )}
            </Fab>
          </motion.div>
        </Box>

        {/* Chat Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            p: isMobile ? 1 : 2,
            gap: 0.75,
            "&::-webkit-scrollbar": {
              display: "none", // For Chrome, Safari, and WebKit-based browsers
            },
            "-ms-overflow-style": "none", // For Internet Explorer and Edge
            "scrollbar-width": "none", // For Firefox
          }}
        >
          {chatMessages.map((msg, index) => {
            const isMessageFromMe = msg.type === "sent";
            const nextMessage = chatMessages[index + 1]; // Look at the next message
            const isSameSenderAsNext =
              nextMessage && nextMessage.type === msg.type;

            const marginBottom = isSameSenderAsNext
              ? isMobile
                ? "6px" // Small gap if the next message is from the same sender
                : "8px"
              : isMobile
                ? "19px" // Larger gap if the next message is from a different sender
                : "22px"; // Larger gap between different senders

            const showAvatar =
              msg.type === "received" &&
              (!nextMessage || nextMessage.type !== msg.type);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: "flex",
                  justifyContent: isMessageFromMe ? "flex-end" : "flex-start",
                  position: "relative",
                  marginBottom: marginBottom, // Apply the margin based on the next message
                }}
              >
                {showAvatar && (
                  <Avatar
                    src={contact.profilePicture}
                    alt={contact.name}
                    sx={{
                      width: isMobile ? 20 : 24,
                      height: isMobile ? 20 : 24,
                      position: "absolute",
                      bottom: -3,
                      left: -2,
                      zIndex: 1,
                    }}
                  />
                )}
                <Box
                  sx={{
                    maxWidth: "70%",
                    wordWrap: "break-word",
                    backgroundColor: isMessageFromMe
                      ? currentThemeMode === "light"
                        ? "#48c774" // Light mode sent message background
                        : "#2ecc71" // Dark mode sent message background
                      : currentThemeMode === "light"
                        ? "#e6e6e6" // Light mode received message background
                        : "#3b3b3b", // Dark mode received message background
                    color: isMessageFromMe
                      ? "#fff"
                      : currentThemeMode === "light"
                        ? "#000"
                        : "#fff", // Text color adjustment based on theme and message type
                    padding: isMobile ? "8px 12px" : "10px 14px",

                    boxShadow:
                      currentThemeMode === "dark"
                        ? isMessageFromMe //config for dark mode
                          ? "0 0 10px 2px rgba(72, 199, 116, 0.38)" //my texts
                          : "0 0 10px 2px rgba(200, 200, 200, 0.17)" //others texts
                        : isMessageFromMe //config for light mode
                          ? "0 0 10px 2px rgba(72, 199, 116, 0.5)" // my texts
                          : "0 0 10px 2px rgba(0, 0, 0, 0.2)", // others texts

                    borderRadius: "32px",
                    position: "relative",
                    zIndex: 0,
                    marginLeft: !isMessageFromMe ? "24px" : 0,
                    transition: "background-color 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      boxShadow: isMessageFromMe
                        ? "0 0 15px 5px rgba(72, 199, 116, 0.95)" // Stronger glow on hover for sent messages
                        : "0 0 15px 5px rgba(255, 255, 255, 0.75)", // Stronger glow on hover for received messages
                    },
                  }}
                >
                  {msg.message}
                </Box>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </Box>

        {/* Message Input */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: (theme) => theme.palette.background.paper, // Dynamic paper background
            padding: isMobile ? "8px" : "10px",
            flexShrink: 0,
          }}
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <TextField
            fullWidth
            variant="outlined"
            value={newMessage}
            placeholder="Say something good :)"
            onChange={(e) => setNewMessage(e.target.value)}
            size={isMobile ? "small" : "medium"}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            sx={{
              backgroundColor: (theme) =>
                theme.palette.action.disabledBackground, // Dynamic default background
              borderRadius: "20px",
              padding: "10px",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0px 4px 15px rgba(255, 255, 255, 0.1), 0px 0px 10px rgba(0, 255, 255, 0.07)" // Neon glow effect in dark mode
                  : "0px 4px 12px rgba(0, 0, 0, 0.28), 0px 0px 5px rgba(0, 0, 0, 0.1)", // Subtle shadow for light mode
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px",
                "& fieldset": {
                  border: "none",
                },
              },
            }}
            InputProps={{
              style: { color: (theme) => theme.palette.text.primary }, // Dynamic text color
            }}
          />
          <IconButton
            onClick={sendMessage}
            sx={{
              ml: 2,
              backgroundColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "#2ecc71" // Neon glow effect in dark mode
                  : "#48c774",
              color: "#f3f3f3",
              borderRadius: "50%",
              width: isMobile ? 40 : 50,
              height: isMobile ? 40 : 50,
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 0 10px 2px rgba(72, 199, 116, 0.38)" // Neon glow effect in dark mode
                  : "0 0 10px 2px rgba(72, 199, 116, 0.5)",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }}
            component={motion.div}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SendIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
          </IconButton>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ChatWindow;
