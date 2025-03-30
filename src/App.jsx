// src/App.jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUploader from './components/FileUploader';
import ConversionOptions from './components/ConversionOptions';
import DownloadButton from './components/DownloadButton';
import { saveAs } from 'file-saver';
import mime from 'mime-types';
import './App.css'; // We'll create this next

const SUPPORTED_OUTPUT_FORMATS = {
    jpeg: { mime: 'image/jpeg', extension: 'jpg', label: 'JPEG' },
    png: { mime: 'image/png', extension: 'png', label: 'PNG' },
    webp: { mime: 'image/webp', extension: 'webp', label: 'WebP' },
    // Add more formats here if needed (e.g., bmp, tiff)
    // Note: GIF conversion is complex client-side, especially animation.
    // bmp: { mime: 'image/bmp', extension: 'bmp', label: 'BMP' },
};

function App() {
    const [inputFile, setInputFile] = useState(null);
    const [inputFormat, setInputFormat] = useState('');
    const [outputFormat, setOutputFormat] = useState(Object.keys(SUPPORTED_OUTPUT_FORMATS)[0]); // Default to first format
    const [convertedDataUrl, setConvertedDataUrl] = useState(null);
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState('');
    const [fileName, setFileName] = useState('');

    const resetState = () => {
        setInputFile(null);
        setInputFormat('');
        setConvertedDataUrl(null);
        setIsConverting(false);
        setError('');
        setFileName('');
        // Optionally reset outputFormat too, or keep user's last selection
        // setOutputFormat(Object.keys(SUPPORTED_OUTPUT_FORMATS)[0]);
    };

    const handleFileAccept = useCallback((acceptedFiles) => {
        resetState(); // Reset on new file upload
        const file = acceptedFiles[0];
        if (!file) return;

        // Basic MIME type check
        if (!file.type.startsWith('image/')) {
            setError(`Unsupported file type: ${file.type || 'unknown'}. Please upload an image.`);
            return;
        }

        // Extract and store filename without extension
        const nameWithoutExtension = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setFileName(nameWithoutExtension);

        // Auto-detect format (rudimentary based on MIME)
        const detectedMime = file.type;
        const detectedFormatLabel = mime.extension(detectedMime)?.toUpperCase() || 'Unknown';
        setInputFormat(detectedFormatLabel);

        setInputFile(file);
        setError(''); // Clear previous errors

    }, []);

    const handleConversion = useCallback(async () => {
        if (!inputFile || !outputFormat) return;

        setIsConverting(true);
        setError('');
        setConvertedDataUrl(null); // Clear previous result

        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext('2d');

                    // Handle transparency for PNG -> JPEG conversion
                    if (inputFormat !== 'PNG' && outputFormat === 'jpeg') {
                        ctx.fillStyle = '#ffffff'; // White background
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }

                    ctx.drawImage(img, 0, 0);

                    const targetMime = SUPPORTED_OUTPUT_FORMATS[outputFormat].mime;
                    let quality = outputFormat === 'jpeg' ? 0.92 : undefined; // Quality setting mainly for JPEG/WebP

                    // Use toBlob for better performance/memory with large images
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            throw new Error('Canvas toBlob conversion failed.');
                        }
                        const url = URL.createObjectURL(blob);
                        setConvertedDataUrl(url);
                        setIsConverting(false);
                    }, targetMime, quality);

                } catch (err) {
                    console.error("Conversion error:", err);
                    setError(`Conversion failed: ${err.message}`);
                    setIsConverting(false);
                } finally {
                    // Clean up the original image object URL if needed, though usually handled by browser GC
                }
            };

            img.onerror = () => {
                setError('Failed to load the image data. The file might be corrupted.');
                setIsConverting(false);
            };

            img.src = event.target.result; // Set src AFTER defining onload/onerror
        };

        reader.onerror = () => {
            setError('Failed to read the file.');
            setIsConverting(false);
        };

        reader.readAsDataURL(inputFile); // Read file as Data URL

    }, [inputFile, outputFormat, inputFormat]);

    const handleDownload = () => {
        if (!convertedDataUrl || !fileName) return;
        const finalExtension = SUPPORTED_OUTPUT_FORMATS[outputFormat].extension;
        const finalFilename = `${fileName}.${finalExtension}`;
        saveAs(convertedDataUrl, finalFilename);

        // Optional: Revoke URL after a delay to ensure download starts
        setTimeout(() => URL.revokeObjectURL(convertedDataUrl), 1000);
    };

    const handleOutputFormatChange = (e) => {
        setOutputFormat(e.target.value);
        setConvertedDataUrl(null); // Clear old result when format changes
    };

    return (
        <motion.div
            className="app-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <header className="app-header">
                <h1>// IMAGE FORMAT CONVERTER_</h1>
            </header>

            <main className="app-main">
                <AnimatePresence mode="wait">
                    {!inputFile ? (
                        <motion.div
                            key="uploader"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <FileUploader onFileAccept={handleFileAccept} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="converter"
                            className="conversion-workflow"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="file-info">
                                <p>Input File: <span>{inputFile.name}</span></p>
                                <p>Detected Format: <span>{inputFormat || 'Detecting...'}</span></p>
                            </div>

                            <ConversionOptions
                                selectedFormat={outputFormat}
                                onFormatChange={handleOutputFormatChange}
                                supportedFormats={SUPPORTED_OUTPUT_FORMATS}
                            />

                            <motion.button
                                className="convert-button"
                                onClick={handleConversion}
                                disabled={isConverting || !!convertedDataUrl}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isConverting ? 'Processing...' : (convertedDataUrl ? 'Converted!' : 'Initiate Conversion')}
                            </motion.button>

                            <AnimatePresence>
                                {isConverting && (
                                    <motion.div
                                        className="progress-indicator"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <div className="spinner"></div>
                                        <span>Converting Matrix...</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence>
                                {convertedDataUrl && !isConverting && (
                                    <motion.div
                                        key="download"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.3 }}
                                    >
                                        <DownloadButton onDownload={handleDownload} />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button onClick={resetState} className="reset-button">
                                Upload New Image
                            </button>

                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="error-message"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            role="alert"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="app-footer">
                <p>© {new Date().getFullYear()} Yashiel Sookdeo Dev</p>
            </footer>
        </motion.div>
    );
}

export default App;