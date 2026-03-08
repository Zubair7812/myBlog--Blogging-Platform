import './EmptyState.css';

const EmptyState = ({ icon, message, action }) => {
    return (
        <div className="empty-state">
            <div className="empty-icon-wrapper">
                <i className={`fas ${icon} empty-icon`}></i>
            </div>
            <h3 className="empty-message">{message}</h3>
            {action && (
                <div className="empty-action">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
