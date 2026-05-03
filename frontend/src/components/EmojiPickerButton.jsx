import { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import './EmojiPickerButton.css';

const EmojiPickerButton = ({ onEmojiClick }) => {
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowPicker(false);
            }
        };

        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPicker]);

    const handleEmojiClick = (emojiObject) => {
        onEmojiClick(emojiObject.emoji);
        setShowPicker(false);
    };

    return (
        <div className="emoji-picker-container" ref={pickerRef}>
            <button
                type="button"
                className="emoji-trigger-btn"
                onClick={() => setShowPicker(!showPicker)}
                title="Add emoji"
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
            </button>
            {showPicker && (
                <div className="emoji-picker-wrapper">
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        width={320}
                        height={400}
                        previewConfig={{ showPreview: false }}
                    />
                </div>
            )}
        </div>
    );
};

export default EmojiPickerButton;
