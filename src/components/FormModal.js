import React, { useState } from "react";
import {
  Modal,
  Typography,
  Button,
  TextField,
  Box,
  Avatar,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

export default function FormModal({ isModalOpen, setIsModalOpen }) {
  const [name, setName] = useState("");
  const [profilePic, setProfilePic] = useState(null); // For preview
  const [profilePicFile, setProfilePicFile] = useState(null); // For actual file upload
  const [uniqueId, setUniqueId] = useState("");

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePic(URL.createObjectURL(file)); // Preview the image
    }
  };

  const saveContactData = async () => {
    if (!name || !uniqueId || !profilePicFile) {
      alert("Please fill out all fields and upload a profile picture.");
      return;
    }

    const contactDir = `contacts/${name}`;

    try {
      // Create a directory for the contact
      await Filesystem.mkdir({
        path: contactDir,
        directory: Directory.Documents, // Use Documents for more accessibility
        recursive: true,
      }).catch((err) => {
        if (err.message !== "Directory exists") {
          throw err;
        }
      });

      // Save contact details as JSON
      const contactDetails = {
        name,
        uniqueId,
      };

      await Filesystem.writeFile({
        path: `${contactDir}/contact_details.json`,
        data: JSON.stringify(contactDetails),
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });

      // Convert the image file to base64 and save
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result.split(",")[1]; // Extract base64 data
        await Filesystem.writeFile({
          path: `${contactDir}/profile_picture.png`,
          data: base64data,
          directory: Directory.Documents,
          encoding: Encoding.Base64,
        });
        alert("Contact saved successfully!");
      };
      reader.readAsDataURL(profilePicFile);
    } catch (error) {
      console.error("Error saving contact:", error);
      alert("Failed to save contact.");
    }

    // Close the modal after saving
    setIsModalOpen(false);
  };

  return (
    <>
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          component={motion.div}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            width: { xs: "90%", sm: 400 }, // Responsive width
            maxWidth: "100vw", // Ensure it doesn't exceed screen width
            maxHeight: "90vh", // Ensure it doesn't exceed screen height
            overflowY: "auto", // Scroll when content overflows
            padding: { xs: 2, sm: 4 }, // Add padding for mobile and larger screens
          }}
        >
          <Typography variant="h4" sx={{ mb: 2, textAlign: "center" }}>
            User Info Form
          </Typography>

          {/* Form for Name, Profile Pic, and ID */}
          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
            noValidate
            autoComplete="off"
          >
            <TextField
              label="Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />

            {/* Profile Picture Upload */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                src={profilePic}
                sx={{ width: 56, height: 56 }}
                alt="Profile Pic"
              />
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="label"
              >
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleProfilePicChange}
                />
                <PhotoCamera />
              </IconButton>
            </Box>

            <TextField
              label="Unique ID"
              variant="outlined"
              value={uniqueId}
              onChange={(e) => setUniqueId(e.target.value)}
              fullWidth
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={saveContactData}
            >
              Submit
            </Button>
          </Box>

          <Button
            variant="outlined"
            sx={{ mt: 2, width: "100%" }}
            onClick={() => setIsModalOpen(false)}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </>
  );
}
