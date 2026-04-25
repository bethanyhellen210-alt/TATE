import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation, AnimatePresence, useSpring } from 'framer-motion';
import './GlobalLoading.scss';
import LOGO from './Logo/LOGO.png';

const GlobalLoading = () => {
    const [progress, setProgress] = useState(0);
    const [loadingComplete, setLoadingComplete] = useState(false);
    const controls = useAnimation();
    const [statusMessage, setStatusMessage] = useState("Initializing quantum trading engine...");
    const [particles, setParticles] = useState([]);
    const [dataPoints, setDataPoints] = useState([]);
    const containerRef = useRef(null);
    
    // Spring-based progress for smoother animation
    const springProgress = useSpring(progress, {
        stiffness: 100,
        damping: 30,
        mass: 0.5
    });

    // Create dynamic data visualization
    useEffect(() => {
        const points = [];
        const now = Date.now();
        for (let i = 0; i < 50; i++) {
            points.push({
                x: Math.random() * 100,
                y: 50 + Math.sin(i * 0.3) * 30,
                value: Math.random() * 100,
                timestamp: now - (50 - i) * 1000
            });
        }
        setDataPoints(points);
    }, []);

    // Create floating particles
    useEffect(() => {
        const newParticles = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1
        }));
        setParticles(newParticles);
    }, []);

    useEffect(() => {
        // Status messages with corresponding progress thresholds
        const messages = [
            { text: "Initializing quantum trading engine...", threshold: 0 },
            { text: "Connecting to blockchain markets...", threshold: 15 },
            { text: "Loading real-time crypto data...", threshold: 25 },
            { text: "Calibrating AI algorithms...", threshold: 40 },
            { text: "Optimizing neural networks...", threshold: 55 },
            { text: "Securing connections...", threshold: 70 },
            { text: "Finalizing setup...", threshold: 85 },
            { text: "Launching dashboard...", threshold: 95 }
        ];

        const progressInterval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + 1;
                
                // Update status message based on progress
                const currentMessage = messages
                    .filter(m => newProgress >= m.threshold)
                    .pop();
                if (currentMessage) {
                    setStatusMessage(currentMessage.text);
                }

                if (newProgress >= 100) {
                    clearInterval(progressInterval);
                    setLoadingComplete(true);
                    setTimeout(() => {
                        if (containerRef.current) {
                            containerRef.current.style.opacity = '0';
                            setTimeout(() => {
                                if (containerRef.current) {
                                    containerRef.current.style.display = 'none';
                                }
                            }, 500);
                        }
                    }, 1000);
                    return 100;
                }
                return newProgress;
            });
        }, 80);

        // Animated entrance
        setTimeout(() => {
            controls.start('visible');
        }, 300);

        return () => {
            clearInterval(progressInterval);
        };
    }, []);

    // Interactive stats with random updates
    const [stats, setStats] = useState({
        latency: "0.034s",
        accuracy: "99.8%",
        transactions: "1,247",
        uptime: "100%"
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                latency: `${(Math.random() * 0.02 + 0.03).toFixed(3)}s`,
                accuracy: `${(98.5 + Math.random() * 2).toFixed(1)}%`,
                transactions: `${Math.floor(Math.random() * 100 + 1200).toLocaleString()}`,
                uptime: "100%"
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Animated gradient background
    const gradientAnimation = useAnimation();

    useEffect(() => {
        gradientAnimation.start({
            backgroundPosition: ['0% 0%', '100% 100%'],
            transition: {
                duration: 20,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'linear'
            }
        });
    }, [gradientAnimation]);

    // Holographic effect for logo
    const hologramControls = useAnimation();

    useEffect(() => {
        hologramControls.start({
            backgroundPosition: ['0% 50%', '100% 50%'],
            transition: {
                duration: 3,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'linear'
            }
        });
    }, [hologramControls]);

    return (
        <motion.div 
            ref={containerRef}
            className='global-loading'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Animated gradient background */}
            <motion.div 
                className='background-gradient'
                animate={gradientAnimation}
                style={{
                    background: 'linear-gradient(45deg, #000428, #004e92, #000428)',
                    backgroundSize: '400% 400%'
                }}
            />
            
            {/* Floating particles */}
            <div className="floating-particles">
                {particles.map(particle => (
                    <motion.div
                        key={particle.id}
                        className="particle"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: particle.size,
                            height: particle.size
                        }}
                        animate={{
                            y: [0, -20, 0],
                            x: [0, Math.sin(particle.id) * 10, 0]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            {/* Data visualization grid */}
            <div className="data-visualization">
                {dataPoints.map((point, index) => (
                    <motion.div
                        key={index}
                        className="data-point"
                        style={{
                            left: `${point.x}%`,
                            bottom: `${point.y}%`
                        }}
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.1
                        }}
                    />
                ))}
                <svg className="data-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <motion.path
                        d={dataPoints.map((p, i) => 
                            `${i === 0 ? 'M' : 'L'} ${p.x} ${100 - p.y}`
                        ).join(' ')}
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="2"
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00f2fe" />
                            <stop offset="100%" stopColor="#4facfe" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Main content */}
            <div className="loading-content">
                {/* Logo with holographic effect */}
                <motion.div
                    className='logo-container'
                    initial={{ opacity: 0, y: -50 }}
                    animate={controls}
                    variants={{
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: {
                                duration: 0.8,
                                ease: [0.17, 0.67, 0.24, 0.99],
                            },
                        },
                    }}
                >
                    <motion.div
                        className="holographic-logo"
                        animate={{ 
                            rotateY: [0, 360],
                        }}
                        transition={{ 
                            duration: 20, 
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    >
                        <div className="logo-inner">
                            <img src={LOGO} alt='Quantum Trading' className='logo' />
                            <motion.div 
                                className="hologram-overlay"
                                animate={hologramControls}
                            />
                        </div>
                    </motion.div>
                    
                    <motion.div
                        className='logo-text'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                    >
                        <span className="logo-title">QUANTUM</span>
                        <span className="logo-subtitle">TRADING SYSTEM</span>
                    </motion.div>
                </motion.div>

                {/* Progress section */}
                <div className='progress-section'>
                    <div className='progress-header'>
                        <motion.span 
                            className='progress-title'
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            SYSTEM INITIALIZATION
                        </motion.span>
                        <motion.span 
                            className='progress-percent'
                            style={{ scale: springProgress }}
                        >
                            {Math.round(progress)}%
                        </motion.span>
                    </div>
                    
                    {/* Animated progress bar with glow effect */}
                    <div className='progress-container'>
                        <motion.div
                            className='progress-bar'
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 8, ease: 'easeOut' }}
                        />
                        <div className="progress-glow" />
                    </div>
                    
                    <div className='progress-labels'>
                        <motion.span 
                            className='progress-message'
                            key={statusMessage}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <span className="message-icon">⟳</span>
                            {statusMessage}
                        </motion.span>
                    </div>
                </div>

                {/* Live stats grid - responsive layout */}
                <div className='live-stats-grid'>
                    {Object.entries(stats).map(([key, value]) => (
                        <motion.div
                            key={key}
                            className='stat-card'
                            whileHover={{ scale: 1.05 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: key.charCodeAt(0) * 0.1 }}
                        >
                            <div className='stat-icon'>
                                {key === 'latency' && '⚡'}
                                {key === 'accuracy' && '🎯'}
                                {key === 'transactions' && '💱'}
                                {key === 'uptime' && '🟢'}
                            </div>
                            <div className='stat-value'>{value}</div>
                            <div className='stat-label'>{key.toUpperCase()}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Connection nodes */}
                <div className="connection-nodes">
                    {[0, 1, 2, 3, 4].map((node) => (
                        <motion.div
                            key={node}
                            className="node"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: node * 0.2
                            }}
                        />
                    ))}
                    <div className="connection-line" />
                </div>
            </div>

            {/* Loading indicators */}
            <div className='loading-indicators'>
                <motion.div 
                    className="quantum-loader"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                    <div className="quantum-ring" />
                    <div className="quantum-core" />
                </motion.div>
                <motion.div 
                    className='loading-text'
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    Quantum Processing
                </motion.div>
            </div>

            {/* Animated footer */}
            <motion.div 
                className="loading-footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
            >
                <div className="footer-items">
                    <motion.div 
                        className="footer-item"
                        whileHover={{ scale: 1.1 }}
                    >
                        <span className="footer-icon">🧠</span>
                        <span>AI-Powered</span>
                    </motion.div>
                    <div className="footer-divider">•</div>
                    <motion.div 
                        className="footer-item"
                        whileHover={{ scale: 1.1 }}
                    >
                        <span className="footer-icon">⚡</span>
                        <span>Real-time</span>
                    </motion.div>
                    <div className="footer-divider">•</div>
                    <motion.div 
                        className="footer-item"
                        whileHover={{ scale: 1.1 }}
                    >
                        <span className="footer-icon">🔒</span>
                        <span>Secure</span>
                    </motion.div>
                </div>
            </motion.div>

            {/* Completion animation */}
            <AnimatePresence>
                {loadingComplete && (
                    <motion.div
                        className="completion-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="completion-check"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", damping: 10 }}
                        >
                            ✓
                        </motion.div>
                        <motion.div
                            className="completion-text"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            System Ready
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default GlobalLoading;