import './Skeleton.css';

const SkeletonLoader = ({ type = 'text', count = 1 }) => {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className="skeleton-card">
                        <div className="skeleton-img"></div>
                        <div className="skeleton-content">
                            <div className="skeleton-line width-50"></div>
                            <div className="skeleton-line width-80"></div>
                            <div className="skeleton-line width-100"></div>
                            <div className="skeleton-line width-30"></div>
                        </div>
                    </div>
                );
            case 'post-detail':
                return (
                    <div className="skeleton-detail">
                        <div className="skeleton-line width-60 title"></div>
                        <div className="skeleton-line width-30 meta"></div>
                        <div className="skeleton-img large"></div>
                        <div className="skeleton-content-block">
                            <div className="skeleton-line width-100"></div>
                            <div className="skeleton-line width-100"></div>
                            <div className="skeleton-line width-100"></div>
                            <div className="skeleton-line width-80"></div>
                        </div>
                    </div>
                );
            case 'avatar':
                return <div className="skeleton-avatar"></div>;
            case 'text':
            default:
                return <div className="skeleton-line width-100"></div>;
        }
    };

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="skeleton-wrapper">
                    {renderSkeleton()}
                </div>
            ))}
        </>
    );
};

export default SkeletonLoader;
