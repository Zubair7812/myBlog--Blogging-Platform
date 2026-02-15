import { useRef, useLayoutEffect } from 'react';

const AutoResizeTextarea = ({ value, onChange, placeholder, className, minRows = 3, ...props }) => {
    const textareaRef = useRef(null);

    useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            // Reset height to auto to correctly shrink
            textarea.style.height = 'auto';
            // Set height to scrollHeight
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={className}
            rows={minRows}
            style={{
                resize: 'none',
                overflow: 'hidden',
                minHeight: '100px',
                ...props.style // Allow overriding styles
            }}
            {...props}
        />
    );
};

export default AutoResizeTextarea;
