import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { ArrowLeft, Check, Leaf, Ban, Globe } from 'lucide-react';
import '../styles/index.css';

const DietaryProfile = ({ onClose }) => {
    const { user } = useAuth();
    const { language, setLanguage } = useLanguage();
    const [diet, setDiet] = useState('none');
    const [allergies, setAllergies] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                const docRef = doc(db, "users", user.uid);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    setDiet(snap.data().diet || 'none');
                    setAllergies(snap.data().allergies || '');
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, [user]);

    const handleSave = async () => {
        if (user) {
            const docRef = doc(db, "users", user.uid);
            await updateDoc(docRef, {
                diet: diet,
                allergies: allergies
            });
        }
        onClose();
    };

    const languages = [
        { code: 'en', label: 'English', icon: '🇺🇸' },
        { code: 'ko', label: '한국어', icon: '🇰🇷' },
        { code: 'ja', label: '日本語', icon: '🇯🇵' },
        { code: 'es', label: 'Español', icon: '🇪🇸' },
        { code: 'fr', label: 'Français', icon: '🇫🇷' },
        { code: 'zh', label: '中文', icon: '🇨🇳' },
    ];

    const diets = [
        { id: 'none', label: 'None (Everything)', icon: <Check size={18} /> },
        { id: 'vegan', label: 'Vegan (No Animal Products)', icon: <Leaf size={18} color="#4ade80" /> },
        { id: 'vegetarian', label: 'Vegetarian (No Meat)', icon: <Leaf size={18} color="#facc15" /> },
        { id: 'halal', label: 'Halal', icon: <Globe size={18} color="#60a5fa" /> },
        { id: 'kosher', label: 'Kosher', icon: <Globe size={18} color="#a78bfa" /> },
        { id: 'gluten_free', label: 'Gluten Free', icon: <Ban size={18} color="#fb7185" /> },
    ];

    return (
        <div className="full-screen flex-center" style={{ flexDirection: 'column', background: '#0a0a0a', padding: '0' }}>
            {/* Header */}
            <div style={{
                width: '100%',
                padding: '20px',
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(20, 20, 20, 0.95)'
            }}>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>Settings & Profile</h2>
                <div style={{ width: '24px' }}></div>
            </div>

            <div style={{ flex: 1, width: '100%', overflowY: 'auto', padding: '20px' }}>

                {/* Language Section */}
                <h3 style={{ color: 'var(--bro-green)', marginBottom: '15px', marginTop: '10px' }}>Language</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '30px' }}>
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            style={{
                                padding: '15px',
                                background: language === lang.code ? 'rgba(0,255,136,0.1)' : '#1a1a1a',
                                border: language === lang.code ? '1px solid var(--bro-green)' : '1px solid #333',
                                borderRadius: '10px',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: 'pointer'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{lang.icon}</span>
                            <span>{lang.label}</span>
                        </button>
                    ))}
                </div>

                {/* Dietary Section */}
                <h3 style={{ color: 'var(--bro-green)', marginBottom: '15px' }}>Dietary Profile</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
                    {diets.map(d => (
                        <button
                            key={d.id}
                            onClick={() => setDiet(d.id)}
                            style={{
                                padding: '15px',
                                background: diet === d.id ? 'rgba(0,255,136,0.1)' : '#1a1a1a',
                                border: diet === d.id ? '1px solid var(--bro-green)' : '1px solid #333',
                                borderRadius: '10px',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {d.icon}
                                <span>{d.label}</span>
                            </div>
                            {diet === d.id && <Check size={18} color="var(--bro-green)" />}
                        </button>
                    ))}
                </div>

                {/* Allergies */}
                <h3 style={{ color: 'var(--bro-green)', marginBottom: '15px' }}>Allergies (Optional)</h3>
                <textarea
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Peanuts, Shellfish, Dairy..."
                    style={{
                        width: '100%',
                        padding: '15px',
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '10px',
                        color: 'white',
                        height: '80px',
                        fontFamily: 'inherit'
                    }}
                />

                <div style={{ height: '50px' }}></div>
            </div>

            {/* Save Button */}
            <div style={{ width: '100%', padding: '20px', background: '#111', borderTop: '1px solid #333' }}>
                <button className="btn-primary" onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }}>
                    Save Profile
                </button>
            </div>
        </div>
    );
};

export default DietaryProfile;
