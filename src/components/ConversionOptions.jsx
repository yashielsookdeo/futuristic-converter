// src/components/ConversionOptions.jsx
import React from 'react';
import './ConversionOptions.css'; // Create this file next

const ConversionOptions = ({ selectedFormat, onFormatChange, supportedFormats }) => {
    return (
        <div className="conversion-options">
            <label htmlFor="output-format-select" className="options-label">Select Output Format:</label>
            <select
                id="output-format-select"
                value={selectedFormat}
                onChange={onFormatChange}
                className="format-select"
                aria-label="Select output image format"
            >
                {Object.entries(supportedFormats).map(([key, { label }]) => (
                    <option key={key} value={key}>
                        {label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ConversionOptions;