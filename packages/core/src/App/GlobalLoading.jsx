import React, { useEffect, useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import './GlobalLoading.scss';
import LOGO from './Logo/LOGO.png';

const GlobalLoading = () => {
    const [progress, setProgress] = useState(0);
    const controls = useAnimation();
    const [showElements, setShowElements] = useState(false);
    const [statusMessage, setStatusMessage] = useState("Initializing trading engine...");
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        // Handle window resize
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        
        // Update status messages
        const messageInterval = setInterval(() => {
            const messages = [
                "Initializing trading engine...",
                "Connecting to markets...",
                "Loading price data...",
                "Calibrating algorithms...",
                "Almost ready...",
                "Optimizing performance..."
            ];
            setStatusMessage(messages[Math.floor(Math.random() * messages.length)]);
        }, 2000);

        // 8 second progress timer
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + 1;
                if (newProgress >= 100) {
                    clearInterval(progressInterval);
                    clearInterval(messageInterval);
                }
                return newProgress;
            });
        }, 80);

        // Animated entrance
        setTimeout(() => {
            controls.start('visible');
            setShowElements(true);
        }, 500);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(progressInterval);
            clearInterval(messageInterval);
        };
    }, []);

    // Adjust number of grid lines based on screen size
    const gridLinesCount = windowSize.width < 768 ? 10 : 20;

    return (
        <div className='global-loading'>
            {/* Background image with overlay */}
            <div className='background-image' style={{ backgroundImage: `url(${LOGO})` }}></div>
            <div className='background-overlay'></div>
            
            {/* Simple background with gradient */}
            <div className='background-gradient'></div>
            
            {/* Animated grid lines */}
            <div className="grid-lines">
                {Array.from({ length: gridLinesCount }).map((_, i) => (
                    <div key={i} className="grid-line" style={{'--index': i}}></div>
                ))}
            </div>

            {/* Main content */}
            <motion.div
                className='logo-container'
                initial={{ opacity: 0, scale: 0.8 }}
                animate={controls}
                variants={{
                    visible: {
                        opacity: 1,
                        scale: 1,
                        transition: {
                            duration: 0.6,
                            ease: [0.17, 0.67, 0.24, 0.99],
                        },
                    },
                }}
            >
                <motion.div
                    className="logo-wrapper"
                    animate={{ 
                        rotate: [0, -2, 0, 2, 0],
                    }}
                    transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <img src={LOGO} alt='Trading System' className='logo' />
                </motion.div>
                <motion.div
                    className='logo-text'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    TRADING SYSTEM
                </motion.div>
            </motion.div>

            {showElements && (
                <div className='content-wrapper'>
                    {/* Progress section */}
                    <div className='progress-section'>
                        <div className='progress-header'>
                            <span className='progress-title'>SYSTEM INITIALIZATION</span>
                            <span className='progress-percent'>{progress}%</span>
                        </div>
                        <div className='progress-container'>
                            <motion.div
                                className='progress-bar'
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 8, ease: 'easeOut' }}
                            />
                        </div>
                        <div className='progress-labels'>
                            <span className='progress-message'>{statusMessage}</span>
                        </div>
                    </div>

                    {/* Stats grid - changes layout on mobile */}
                    <div className='stats-grid'>
                        <div className='stat-item'>
                            <div className='stat-icon'>📈</div>
                            <div className='stat-value'>+2.34%</div>
                            <div className='stat-label'>Today's Gain</div>
                        </div>
                        <div className='stat-item'>
                            <div className='stat-icon'>⚡</div>
                            <div className='stat-value'>0.04s</div>
                            <div className='stat-label'>Response Time</div>
                        </div>
                        <div className='stat-item'>
                            <div className='stat-icon'>🔒</div>
                            <div className='stat-value'>100%</div>
                            <div className='stat-label'>Security</div>
                        </div>
                    </div>

                    {/* Loading indicators */}
                    <div className='loading-indicators'>
                        <motion.div 
                            className="loading-icon"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            ⏳
                        </motion.div>
                        <div className='loading-text'>Processing</div>
                    </div>
                </div>
            )}

            {/* Status message */}
            <AnimatePresence>
                <motion.div
                    className='status-message'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        transition: { delay: 0.6 },
                    }}
                    exit={{ opacity: 0 }}
                >
                    <span className='status-icon'>💹</span> Preparing your trading experience...
                </motion.div>
            </AnimatePresence>

            {/* Footer with additional info - changes layout on mobile */}
            <motion.div 
                className="loading-footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
            >
                <div className="footer-item">
                    <span>Advanced Algorithms</span>
                </div>
                <div className="footer-item">
                    <span>Real-time Data</span>
                </div>
                <div className="footer-item">
                    <span>Secure Connection</span>
                </div>
            </motion.div>
        </div>
    );
};

export default GlobalLoading;