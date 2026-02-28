import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Camera, RefreshCw, Zap, Clock, Share2, Settings, Flame, Trophy, AlertTriangle, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import '../styles/index.css';

const CameraView = ({ onCapture, onHistory, onShare, onProfile, onLeaderboard, isRoastMode, setIsRoastMode }) => {
    const { streak } = useAuth();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [facingMode, setFacingMode] = useState('environment');
    const [flash, setFlash] = useState(false);

    // HUD State
    const [predictions, setPredictions] = useState([]);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [hudText, setHudText] = useState('INITIALIZING SENSORS...');
    const [targetLocked, setTargetLocked] = useState(false);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [facingMode]);

    // TensorFlow.js Real-time Detection
    useEffect(() => {
        let model = null;
        let animationFrameId = null;

        const initDeepLearning = async () => {
            try {
                setHudText('LOADING NEURAL NETWORKS (COCO-SSD)...');
                model = await cocoSsd.load();
                setIsModelLoaded(true);
                setHudText('SENSORS ACTIVE. SCANNING...');
                detectFrame();
            } catch (err) {
                console.error("TFJS Load Error:", err);
                setHudText('SENSOR INITIALIZATION FAILED.');
            }
        };

        const detectFrame = async () => {
            if (videoRef.current && videoRef.current.readyState === 4 && model) {
                try {
                    const preds = await model.detect(videoRef.current);
                    setPredictions(preds);

                    // Simple check if any prediction is a typical food/drink
                    const foodClasses = ['apple', 'banana', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'cup', 'bottle', 'bowl', 'wine glass'];
                    const foundFood = preds.some(p => foodClasses.includes(p.class));
                    setTargetLocked(foundFood);
                } catch (e) { }
            }
            animationFrameId = requestAnimationFrame(detectFrame);
        };

        initDeepLearning();

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const startCamera = async () => {
        stopCamera();
        try {
            const constraints = { video: { facingMode: facingMode } };
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);
            if (videoRef.current) videoRef.current.srcObject = newStream;
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Camera access required. Please ensure HTTPS or localhost.");
        }
    };

    const stopCamera = () => {
        if (stream) stream.getTracks().forEach(track => track.stop());
    };

    const toggleCamera = () => setFacingMode(prev => prev === 'user' ? 'environment' : 'user');

    const playShutterSound = () => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    };

    const takePicture = () => {
        if (navigator.vibrate) navigator.vibrate(50);
        playShutterSound();

        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            const MAX_DIMENSION = 800;
            let width = video.videoWidth;
            let height = video.videoHeight;

            if (width > height) {
                if (width > MAX_DIMENSION) {
                    height = Math.round((height * MAX_DIMENSION) / width);
                    width = MAX_DIMENSION;
                }
            } else {
                if (height > MAX_DIMENSION) {
                    width = Math.round((width * MAX_DIMENSION) / height);
                    height = MAX_DIMENSION;
                }
            }

            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);

            const imageSrc = canvas.toDataURL('image/jpeg', 0.8);
            onCapture(imageSrc);
        }
    };

    return (
        <div className="camera-view full-screen" style={{ backgroundColor: 'black', position: 'relative', overflow: 'hidden' }}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="full-screen"
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* AI Head-Up Display (HUD) */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                pointerEvents: 'none', zIndex: 10,
                fontFamily: 'monospace',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                padding: '20px', paddingBottom: '140px'
            }}>
                {/* HUD Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#00ffcc', textShadow: '0 0 5px #00ffcc', fontSize: '0.75rem', marginTop: '60px' }}>
                    <div>
                        <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 2 }}>{hudText}</motion.div>
                        <div>SYS.AI_CORE: {isModelLoaded ? 'ONLINE' : 'BOOTING'}</div>
                        <div>RADAR DETECTED: {predictions.length}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div>{new Date().toLocaleTimeString()}</div>
                        <div>LAT: UNKNOWN E</div>
                        <div>LNG: UNKNOWN N</div>
                    </div>
                </div>

                {/* Real-time Object List readout */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <AnimatePresence>
                        {predictions.slice(0, 3).map((pred, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                style={{
                                    background: 'rgba(0, 255, 204, 0.1)',
                                    color: '#00ffcc',
                                    padding: '5px 10px',
                                    borderLeft: '4px solid #00ffcc',
                                    marginBottom: '10px',
                                    display: 'inline-block',
                                    alignSelf: 'flex-start',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem',
                                    textShadow: '0 0 5px rgba(0,255,204,0.5)',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                                }}
                            >
                                TARGET: {pred.class} [{(pred.score * 100).toFixed(1)}%]
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Center Reticle */}
                <motion.div
                    animate={{ scale: targetLocked ? 1.05 : 1, borderColor: targetLocked ? 'rgba(0, 255, 136, 0.8)' : 'rgba(0, 255, 204, 0.3)' }}
                    transition={{ duration: 0.3 }}
                    style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '280px', height: '280px',
                        border: '2px dashed rgba(0, 255, 204, 0.3)',
                        borderRadius: '20px',
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}
                >
                    <motion.div
                        animate={{ height: ['0%', '100%', '0%'], top: ['0%', '0%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        style={{
                            position: 'absolute', width: '100%', background: 'linear-gradient(to bottom, transparent, rgba(0,255,204,0.3), transparent)'
                        }}
                    />
                    {targetLocked && (
                        <div style={{ color: '#00ff88', textShadow: '0 0 10px #00ff88', fontWeight: 'bold', letterSpacing: '2px', fontSize: '0.9rem', marginTop: '300px' }}>
                            ORGANIC TARGET LOCKED
                        </div>
                    )}
                </motion.div>
            </div>

            {isRoastMode && (
                <div style={{ position: 'absolute', top: '120px', width: '100%', textAlign: 'center', zIndex: 15, pointerEvents: 'none', animation: 'pulse 2s infinite' }}>
                    <span style={{ background: 'rgba(255,50,50,0.8)', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                        🔥 Roast Mode Active 🔥
                    </span>
                </div>
            )}

            {/* Top Controls */}
            <div style={{ position: 'absolute', top: '20px', width: '100%', zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(0,0,0,0.5)', padding: '8px 12px', borderRadius: '20px', border: '1px solid rgba(255,165,0,0.5)' }}>
                        <Flame size={20} color="orange" fill="orange" />
                        <span style={{ color: 'orange', fontWeight: 'bold' }}>{streak}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setIsRoastMode(!isRoastMode)} style={{ background: isRoastMode ? 'rgba(255,50,50,0.8)' : 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '50%', color: 'white', border: isRoastMode ? '2px solid white' : '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}>
                        <AlertTriangle size={20} color={isRoastMode ? "white" : "#ff4d4d"} />
                    </button>
                    <button onClick={onShare} style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '50%', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Share2 size={24} /></button>
                    <button onClick={onHistory} style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '50%', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={24} /></button>
                    <button onClick={onLeaderboard} style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '50%', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trophy size={24} color="#00ff88" /></button>
                    <button onClick={onProfile} style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '50%', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings size={24} /></button>
                </div>
            </div>

            {/* Bottom Shutter Controls */}
            <div className="controls-layer" style={{ position: 'absolute', bottom: '30px', width: '100%', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 20 }}>
                <button className="glass-panel" onClick={() => setFlash(!flash)} style={{ padding: '15px', borderRadius: '50%', color: 'white', border: 'none', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
                    <Zap size={24} color={flash ? 'yellow' : 'white'} />
                </button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={takePicture}
                    style={{
                        width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'transparent',
                        border: targetLocked ? '4px solid #00ff88' : (isRoastMode ? '4px solid #ff4d4d' : '4px solid white'),
                        display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
                        boxShadow: targetLocked ? '0 0 20px rgba(0,255,136,0.6)' : 'none',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <div style={{ width: '66px', height: '66px', borderRadius: '50%', backgroundColor: targetLocked ? '#00ff88' : (isRoastMode ? '#ff4d4d' : 'white'), transition: 'background-color 0.3s ease' }}></div>
                </motion.button>

                <button className="glass-panel" onClick={toggleCamera} style={{ padding: '15px', borderRadius: '50%', color: 'white', border: 'none', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
                    <RefreshCw size={24} />
                </button>
            </div>

            <style>{`
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default CameraView;
