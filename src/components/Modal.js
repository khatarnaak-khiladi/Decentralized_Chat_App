import React from "react";
import { Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";

// Modal component definition
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null; // Don't render anything if the modal is closed

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent dark background
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999, // Make sure it appears on top
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "20px",
          position: "relative",
          width: "90vw",
          maxWidth: "600px",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.2)",
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 10, right: 10 }}
        >
          <CloseIcon />
        </IconButton>

        {/* Modal Content */}
        <Box>{children}</Box>
      </motion.div>
    </motion.div>,
    document.body, // Render modal outside the DOM hierarchy of parent components
  );
};

export default Modal;
