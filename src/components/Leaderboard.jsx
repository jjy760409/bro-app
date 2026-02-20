import React, { useEffect } from 'react';
import { Trophy, TrendingUp, Medal, ChevronLeft, Share2, Home } from 'lucide-react';
import '../styles/index.css';

const Leaderboard = ({ onClose }) => {
    // Inject Tailwind CDN just for this component if it's not present, to ensure the Stitch design works flawlessly.
    useEffect(() => {
        if (!document.getElementById('tailwind-cdn')) {
            const script = document.createElement('script');
            script.id = 'tailwind-cdn';
            script.src = 'https://cdn.tailwindcss.com?plugins=forms,container-queries';
            document.head.appendChild(script);

            const config = document.createElement('script');
            config.innerHTML = `
                tailwind.config = {
                    darkMode: "class",
                    theme: {
                        extend: {
                            colors: {
                                "primary": "#00ff88",
                                "background-light": "#f5f8f7",
                                "background-dark": "#0a0a0a",
                                "glass-bg": "rgba(20, 20, 20, 0.7)",
                            },
                            fontFamily: {
                                "display": ["Inter", "sans-serif"]
                            }
                        }
                    }
                }
            `;
            document.head.appendChild(config);
        }
    }, []);

    return (
        <div className="font-display text-slate-100 antialiased" style={{ backgroundColor: '#0a0a0a', minHeight: '100%', width: '100%' }}>
            <div className="relative flex min-h-screen w-full flex-col bg-background-dark overflow-x-hidden max-w-[430px] mx-auto shadow-2xl border-x border-white/5">
                {/* Header */}
                <header className="flex items-center justify-between px-6 pt-12 pb-6 sticky top-0 bg-background-dark/80 backdrop-blur-md z-50">
                    <button onClick={onClose} className="flex items-center justify-center size-10 rounded-full hover:bg-white/5 transition-colors">
                        <ChevronLeft className="text-white" />
                    </button>
                    <h1 className="text-white text-lg font-bold tracking-widest uppercase">Leaderboard</h1>
                    <div className="size-10 flex items-center justify-end">
                        <Share2 className="text-primary" size={20} />
                    </div>
                </header>

                {/* User Rank Hero Section */}
                <section className="px-6 mb-8">
                    <div className="glass-panel rounded-2xl p-6 flex items-center justify-between overflow-hidden relative" style={{ borderRadius: '15px' }}>
                        <div className="relative z-10">
                            <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase mb-1">Your Standing</p>
                            <h2 className="text-4xl font-bold text-white tracking-tight">Rank #42</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-primary text-sm font-bold leading-none" style={{ color: 'var(--bro-green)' }}>+2% this week</span>
                                <TrendingUp className="text-primary text-sm" size={16} color="#00ff88" />
                            </div>
                        </div>
                        <div className="relative z-10 size-16 bg-primary/20 rounded-full flex items-center justify-center">
                            <Trophy className="text-primary text-4xl" size={32} color="#00ff88" />
                        </div>
                        {/* Abstract Background Detail */}
                        <div className="absolute -right-4 -bottom-4 size-32 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(0,255,136,0.1)' }}></div>
                    </div>
                </section>

                {/* Leaderboard List */}
                <main className="flex-1 px-6 space-y-3 pb-32">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white text-sm font-bold tracking-wider uppercase">Top Performers</h3>
                        <span className="text-slate-500 text-[10px] font-medium uppercase tracking-widest">Global • Today</span>
                    </div>

                    {/* Rank 1 */}
                    <div className="glass-panel rounded-xl p-4 flex items-center gap-4 group transition-all" style={{ boxShadow: '0 0 15px rgba(0,255,136,0.3)', border: '1px solid rgba(0,255,136,0.5)', borderRadius: '15px' }}>
                        <div className="flex flex-col items-center justify-center min-w-[24px]">
                            <span className="text-primary font-bold text-lg leading-none" style={{ color: '#00ff88' }}>1</span>
                            <Medal size={16} color="#00ff88" />
                        </div>
                        <div className="size-12 rounded-full p-0.5" style={{ border: '2px solid #00ff88' }}>
                            <div className="size-full rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDBaWXnRls48E2FZMeg5IQamAEvFpW8qyASW3QfcPxFR_O0hBHHax0h1_4fblD_vx3wEgTqoERdUgEdMyQZHP0Rj6ot7yjr3uV2WNmLg_QAYtBHaG-emqy2epDxr91U0T3BrmeUkbYzTZ1ceSXVAf0M_we2Dp3F90I1WummPwFt3KLZyrXirPiQw2xXgvDmQGoGGMbhYCNbEKIbIlRDpwvNAyAr5oH6Ep-p4Y50NhzONHsFjHyYAUiQcgJLacCWYhMa_bCLVW7MwEk')" }}></div>
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-bold text-base">ProteinKing</p>
                            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(0,255,136,0.7)' }}>Bro Elite</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-xl leading-none" style={{ color: '#00ff88' }}>98</p>
                            <p className="text-slate-500 text-[10px] uppercase font-medium">Health Score</p>
                        </div>
                    </div>

                    {/* Rank 2 */}
                    <div className="glass-panel rounded-xl p-4 flex items-center gap-4" style={{ borderRadius: '15px' }}>
                        <div className="flex flex-col items-center justify-center min-w-[24px]">
                            <span className="text-slate-300 font-bold text-lg leading-none">2</span>
                        </div>
                        <div className="size-12 rounded-full border border-white/10 p-0.5">
                            <div className="size-full rounded-full bg-cover bg-center grayscale" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCRaEYbGf3MsQqYaZGp_o-_6xkXwy5XMas61a_cnDhlx2hEkeVYP9DxZnks5HkNkyoFp9YnPA7YzL1G_k1cHe3DU6tJXjQZlaLT9lx4mSjmTmVy5qLmTJAnXJxy77xqZExoA7sCeLK_MopTgmJpoqqekDTvOpd3ZVeKxF08hjEW7zIRz0igqpTfMgYBq1nwG5MhMLvcGzPz1RuxfrLVj565UnathtwMmrAxeQmOT3rCnbazt9EhHse0NZf2ZYpVmlcAhM-daQd1D8s')" }}></div>
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-bold text-base">Chad123</p>
                            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest">Power User</p>
                        </div>
                        <div className="text-right">
                            <p className="text-white font-bold text-lg leading-none">95</p>
                            <p className="text-slate-500 text-[10px] uppercase font-medium">Health Score</p>
                        </div>
                    </div>

                    {/* Rank 3 */}
                    <div className="glass-panel rounded-xl p-4 flex items-center gap-4" style={{ borderRadius: '15px' }}>
                        <div className="flex flex-col items-center justify-center min-w-[24px]">
                            <span className="text-slate-300 font-bold text-lg leading-none">3</span>
                        </div>
                        <div className="size-12 rounded-full border border-white/10 p-0.5">
                            <div className="size-full rounded-full bg-cover bg-center grayscale" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA0YMmGw2dkNxJCAA4elRcwWtw4YMUNnFeZg8YlHIp05T7YpBbc3F_wYTN_o3COYbB5ntp7wQ807SxmytzmZFckpR6GMOFPI7VLBx33pvo70xxtZAy2dZ0kKWrRNmAccZg6vkYO1uxlug0MbD5BlpvybNKhwJ360hezlou81AyPqjNbIx180On0us-IDqYWr3D_qVrH-MqI0i5aIzdG8nXzvBjeSGDMcRnj9hELyzai_1vUKc38VTZjN0IDT-Ywet8MArGKcTIWXgc')" }}></div>
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-bold text-base">FlexMaster</p>
                            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest">Consistent</p>
                        </div>
                        <div className="text-right">
                            <p className="text-white font-bold text-lg leading-none">92</p>
                            <p className="text-slate-500 text-[10px] uppercase font-medium">Health Score</p>
                        </div>
                    </div>
                </main>

                {/* Bottom Panel Information */}
                <div className="fixed bottom-2 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[382px] z-40">
                    <div className="glass-panel rounded-xl p-4 text-center" style={{ borderRadius: '15px' }}>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                            Health Score is calculated based on daily streaks, workout intensity, hydration, and sleep quality. Keep grinding to climb the ranks.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Leaderboard;
