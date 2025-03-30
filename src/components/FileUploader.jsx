// src/components/FileUploader.jsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import './FileUploader.css'; // Create this file next

const FileUploader = ({ onFileAccept }) => {
    const onDrop = useCallback(acceptedFiles => {
        onFileAccept(acceptedFiles);
    }, [onFileAccept]);

    const { getRootProps, getInputProps, isDragActive, isFocused, isDragAccept, isDragReject } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
            'image/gif': ['.gif'],
            'image/bmp': ['.bmp'],
            'image/tiff': ['.tif', '.tiff'],
            // Add more accepted image types if needed
        },
        multiple: false // Only allow single file upload
    });

    const getBorderStyle = () => {
        if (isDragAccept) return '2px dashed var(--color-neon-pink)';
        if (isDragReject) return '2px dashed var(--color-error)';
        if (isFocused) return '2px solid var(--color-neon-pink)';
        return '2px dashed var(--color-dark-gray)';
    };

    const getBackgroundColor = () => {
        if (isDragAccept) return 'rgba(255, 93, 115, 0.1)';
        if (isDragReject) return 'rgba(255, 77, 77, 0.1)';
        return 'transparent';
    };

    return (
        <motion.div
            {...getRootProps()}
            className="file-uploader"
            style={{
                border: getBorderStyle(),
                backgroundColor: getBackgroundColor()
            }}
            whileHover={{
                borderColor: 'var(--color-neon-pink)',
                boxShadow: '0 0 10px var(--color-neon-pink-glow)',
            }}
            transition={{ duration: 0.2 }}
        >
            <input {...getInputProps()} aria-label="File Uploader" />
            {isDragActive ? (
                <p className="upload-text">{isDragReject ? "Unsupported File Type..." : "Release to Upload Image..."}</p>
            ) : (
                <div className="upload-content">
                    <svg className="upload-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
                    <p className="upload-text">Drag & Drop Image Here</p>
                    <p className="upload-subtext">or click to select file</p>
                    <p className="supported-formats">(Supports: JPG, PNG, WebP, GIF, BMP)</p>
                </div>
            )}
        </motion.div>
    );
};

export default FileUploader;