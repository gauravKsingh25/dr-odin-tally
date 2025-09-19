// @flow
import React from 'react';
import { Button } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';

// actions
import { changeLayoutColor } from '../../redux/actions';

// constants
import * as layoutConstants from '../../constants/layout';

import './ThemeToggle.css';

const ThemeToggle = ({ 
    size = 'sm', 
    variant = 'outline-secondary', 
    className = '',
    showText = false 
}) => {
    const dispatch = useDispatch();
    
    const { layoutColor } = useSelector((state) => ({
        layoutColor: state.Layout.layoutColor,
    }));

    const isDarkMode = layoutColor === layoutConstants.LAYOUT_COLOR_DARK;

    /**
     * Toggle between light and dark mode
     */
    const handleThemeToggle = () => {
        const newTheme = isDarkMode 
            ? layoutConstants.LAYOUT_COLOR_LIGHT 
            : layoutConstants.LAYOUT_COLOR_DARK;
        
        dispatch(changeLayoutColor(newTheme));
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleThemeToggle}
            className={`theme-toggle-btn ${className} ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
            title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
        >
            <i className={`mdi ${isDarkMode ? 'mdi-weather-sunny' : 'mdi-weather-night'}`}></i>
            {showText && (
                <span className="ms-1">
                    {isDarkMode ? 'Light' : 'Dark'} Mode
                </span>
            )}
        </Button>
    );
};

export default ThemeToggle;