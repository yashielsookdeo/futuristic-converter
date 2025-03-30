// src/components/DownloadButton.jsx
import React from 'react';
import { motion } from 'framer-motion';
import './DownloadButton.css'; // Create this file next

const DownloadButton = ({ onDownload }) => {
    return (
        <motion.button
            className="download-button"
            onClick={onDownload}
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px var(--color-neon-pink-glow)" }}
            whileTap={{ scale: 0.95 }}
        >
            Download Converted Image
        </motion.button>
    );
};

export default DownloadButton;