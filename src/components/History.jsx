import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { ArrowLeft, Clock } from 'lucide-react';
import '../styles/index.css';

const History = ({ onClose }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            try {
                // Assuming we save scans to a 'scans' collection
                // Since we haven't implemented saving yet, this will be empty but functional
                const q = query(
                    collection(db, "scans"),
                    where("userId", "==", user.uid),
                    orderBy("createdAt", "desc"),
                    limit(20)
                );
                const querySnapshot = await getDocs(q);
                const scans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setHistory(scans);
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user]);

    return (
        <div className="full-screen" style={{ background: '#0a0a0a', padding: '20px', overflowY: 'auto' }}>
            <div className="flex items-center gap-4 mb-6" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.5rem', color: 'var(--bro-green)' }}>Food History</h1>
            </div>

            {loading ? (
                <p style={{ color: '#888', textAlign: 'center' }}>Loading...</p>
            ) : history.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#555', marginTop: '50px' }}>
                    <Clock size={48} style={{ margin: '0 auto 20px auto', opacity: 0.5 }} />
                    <p>No scans yet. Eat something!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {history.map(item => (
                        <div key={item.id} className="glass-panel" style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '50px', height: '50px', background: '#333', borderRadius: '8px', overflow: 'hidden' }}>
                                {/* Imagine we saved the image URL */}
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 'bold' }}>{item.foodName}</h3>
                                <p style={{ color: '#888', fontSize: '0.8rem' }}>{item.calories} kcal • {new Date(item.createdAt?.toDate()).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
