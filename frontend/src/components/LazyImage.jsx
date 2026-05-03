import { useState } from 'react';
import './LazyImage.css';

const LazyImage = ({ src, alt, className, aspectRatio = '16/9', priority = false }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
        <div
            className={`lazy-image-wrapper ${className || ''}`}
            style={{ aspectRatio: aspectRatio }}
        >
            {!isLoaded && !hasError && !src?.includes('default-user.jpg') && (
                <div className="lazy-image-skeleton" />
            )}

            {/* Only render img if it's not the default avatar and hasn't errored */}
            {!hasError && !src?.includes('default-user.jpg') && (
                <img
                    src={src}
                    alt={alt}
                    className={`lazy-image ${isLoaded ? 'loaded' : ''}`}
                    loading={priority ? "eager" : "lazy"}
                    decoding="async"
                    onLoad={() => setIsLoaded(true)}
                    onError={() => {
                        setHasError(true);
                        setIsLoaded(true);
                    }}
                />
            )}
        </div>
    );
};

export default LazyImage;
