import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({
    children,
    icon: Icon,
    className = '',
    to,
    ...props
}) => {
    const content = (
        <span className="flex" style={{ gap: '0.5rem', display: 'inline-flex', alignItems: 'center' }}>
            {Icon && <Icon size={18} />}
            {children}
        </span>
    );

    if (to) {
        return (
            <Link to={to} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <button className={className} {...props}>
            {content}
        </button>
    );
};

export default Button;
