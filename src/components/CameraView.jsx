import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Camera, RefreshCw, Zap, Clock, Share2, Settings, Flame, Trophy, AlertTriangle } from 'lucide-react';
import '../styles/index.css';

const CameraView = ({ onCapture, onHistory, onShare, onProfile, onLeaderboard, isRoastMode, setIsRoastMode }) => {
    const { streak } = useAuth();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'
    const [flash, setFlash] = useState(false);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, [facingMode]);

    const startCamera = async () => {
        stopCamera();
        try {
            const constraints = {
                video: { facingMode: facingMode }
            };
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            // Fallback for laptops/testing without proper camera permissions
            alert("Camera access required. Please ensure HTTPS or localhost.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

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
        if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
        playShutterSound();

        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            // Calculate new dimensions (max 800px on longest side)
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

            // Compress to JPEG with 0.8 quality
            const imageSrc = canvas.toDataURL('image/jpeg', 0.8);
            onCapture(imageSrc);
        }
    };

    return (
        <div className="camera-view full-screen">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="full-screen"
                style={{ objectFit: 'cover' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Overlays */}
            <div className="scan-overlay full-screen pointer-events-none" style={{
                boxShadow: isRoastMode ? 'inset 0 0 100px rgba(255, 50, 50, 0.4)' : 'none',
                transition: 'box-shadow 0.3s ease'
            }}></div>

            {isRoastMode && (
                <div style={{ position: 'absolute', top: '80px', width: '100%', textAlign: 'center', zIndex: 15, pointerEvents: 'none', animation: 'pulse 2s infinite' }}>
                    <span style={{ background: 'rgba(255,50,50,0.8)', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                        🔥 Roast Mode Active 🔥
                    </span>
                </div>
            )}

            {/* Top Controls */}
            <div style={{ position: 'absolute', top: '20px', width: '100%', px: '20px', zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(0,0,0,0.5)', padding: '8px 12px', borderRadius: '20px', border: '1px solid rgba(255,165,0,0.5)' }}>
                        <Flame size={20} color="orange" fill="orange" />
                        <span style={{ color: 'orange', fontWeight: 'bold' }}>{streak}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setIsRoastMode(!isRoastMode)}
                        style={{
                            background: isRoastMode ? 'rgba(255,50,50,0.8)' : 'rgba(0,0,0,0.5)',
                            padding: '10px',
                            borderRadius: '50%',
                            color: 'white',
                            border: isRoastMode ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <AlertTriangle size={20} color={isRoastMode ? "white" : "#ff4d4d"} />
                    </button>
                    <button onClick={onShare} style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '50%', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Share2 size={24} />
                    </button>
                    <button onClick={onHistory} style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '50%', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={24} />
                    </button>
                    <button onClick={onLeaderboard} style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '50%', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trophy size={24} color="#00ff88" />
                    </button>
                    <button onClick={onProfile} style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '50%', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Settings size={24} />
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="controls-layer absolute bottom-0 w-full p-8 flex justify-between items-center"
                style={{ position: 'absolute', bottom: '30px', width: '100%', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 10 }}>

                <button className="glass-panel p-3 rounded-full text-white" onClick={() => setFlash(!flash)} style={{ padding: '15px' }}>
                    <Zap size={24} color={flash ? 'yellow' : 'white'} />
                </button>

                <button
                    className="shutter-btn"
                    onClick={takePicture}
                    style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: 'transparent',
                        border: isRoastMode ? '4px solid #ff4d4d' : '4px solid white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'border-color 0.3s ease'
                    }}
                >
                    <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: isRoastMode ? '#ff4d4d' : 'white', transition: 'background-color 0.3s ease' }}></div>
                </button>

                <button className="glass-panel p-3 rounded-full text-white" onClick={toggleCamera} style={{ padding: '15px' }}>
                    <RefreshCw size={24} />
                </button>
            </div>
            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default CameraView;
