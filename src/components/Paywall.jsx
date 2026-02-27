import React, { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import '../styles/index.css';

const ctaMessages = [
    "☕ 하루 130원으로 식단 고민 끝! 커피 1잔보다 싸게 평생 식단 관리 시작해요.",
    "🔥 월 3,900원으로 무제한 AI 칼로리 분석! 한 번 외식값보다도 저렴해요.",
    "📊 한 끼 잘못 먹으면 +800kcal, SmartCal AI로 사전에 막을 수 있어요.",
    "🧠 1초 스캔으로 음식 인식, 24시간 365일 쉬지 않는 당신만의 식단 비서.",
    "📌 무료 체험 종료까지 남은 시간 동안만 이 가격! 지금 놓치면 다시는 못 볼 수 있어요.",
    "💰 하루 130원 투자로 1년 뒤 몸무게 -5kg를 목표로 관리해 보세요.",
    "📉 1일 3번 잘못된 칼로리 계산 → 1년 뒤 5kg 차이가 될 수 있어요. 지금 바로 정확하게!",
    "🚨 24시간 중 단 5초만 투자하세요. ‘촬영 → 인식 → 칼로리’ 끝.",
    "💡 다이어트 실패율 90%는 ‘기록 안 함’에서 시작됩니다. 우리는 기록을 자동으로 만듭니다.",
    "🏃‍♂️ 오늘 300kcal만 줄여도 한 달에 약 -9,000kcal 절감! 지금 시작하는 사람이 이깁니다.",
    "⚠️ 무료 체험이 끝나면, 다시는 ‘무제한 분석’ 기회를 못 볼 수도 있어요.",
    "🚨 지금 구독하지 않으면, 다음 식사도 ‘대충 계산’으로 넘어가게 됩니다.",
    "⏰ 오늘도 그냥 지나가면, 내일도 같은 몸무게예요. 지금이 바꿀 수 있는 시간.",
    "👀 이미 다른 사람들은 프리미엄으로 음식 데이터를 쌓고 있어요. 나만 뒤처질 건가요?",
    "🧨 ‘나중에 할게…’가 쌓여서 지금 몸무게가 된 거예요. 이번만은 바로 시작해봐요.",
    "❗ 건강검진 결과지 보고 후회하기 전에, 오늘부터 기록을 바꿔보세요.",
    "🔒 무료 모드는 곧 잠깁니다. 프리미엄을 열 수 있는 열쇠는 지금 이 버튼 하나.",
    "🚦 “내일부터…”라고 생각했다면, 이 버튼이 오늘의 마지막 신호일 수 있어요.",
    "🎯 목표 몸무게까지 남은 건 시간이 아니라 ‘시작’입니다. 시작 버튼 = 구독하기.",
    "🌍 매일 0시, 전세계 음식 데이터 자동 업데이트! 살아있는 AI 식단 사전.",
    "🍱 오늘 새로 추가된 음식만 25종! 한식·중식·일식·디저트까지 계속 늘어납니다.",
    "🤖 YOLO 기반 음식 인식 엔진, 매일 조금씩 더 똑똑해지고 있어요.",
    "📈 찍을수록 데이터가 쌓이고, 쌓일수록 당신에게 더 정확해집니다.",
    "🧾 식단 일지를 쓰지 않아도, 카메라만 들면 자동 기록이 쌓입니다.",
    "🔥 “이 정도면 PT 선생님보다 낫다”라는 말을 듣는 게 우리의 목표입니다.",
    "📡 SmartCal AI는 당신이 자는 동안에도 음식 데이터를 배우고 있습니다.",
    "💎 지금 구독하면, 앞으로 추가되는 모든 기능을 가장 먼저 만날 수 있어요.",
    "🧊 ‘데모 모드’는 연습 경기일 뿐, 진짜 경기는 프리미엄에서 시작됩니다.",
    "💚 내 몸에 들어가는 숫자를 아는 순간, 진짜 관리가 시작됩니다.",
    "🥗 오늘의 한 끼가 내일의 몸을 만듭니다. 그냥 먹기엔 너무 아깝잖아요?",
    "🏅 지금의 선택 하나가 3개월 후 사진에서 티가 납니다.",
    "🧩 운동, 수면, 식단 중 가장 빼먹기 쉬운 건 ‘칼로리 기록’입니다. 그걸 우리가 대신 해줄게요.",
    "🎁 지금 구독하면 ‘미래의 나’에게 주는 가장 값싼 선물이 됩니다.",
    "🌱 작은 기록이 쌓여서, 언젠가 거울 앞에서 미소 짓는 날이 옵니다.",
    "⚡ Unlock unlimited SmartCal AI. 1 tap = full nutrition insight.",
    "🔥 Less than $0.1 per day for a 24/7 AI nutrition coach.",
    "📊 Stop guessing, start measuring. Every bite now has a number.",
    "🚀 Join the top 1% of people who actually track their calories correctly.",
    "🧠 Let AI remember every meal so your brain can focus on living.",
    "💰 Cheaper than coffee, more valuable than anything you drink.",
    "🥇 Be the premium user your health deserves.",
    "⏰ Free trial ending soon. Don't let your progress disappear."
];

const Paywall = ({ onSuccess, onClose }) => {
    const { t } = useLanguage();
    const { user, setPremium, cancelSubscription, requestRefund } = useAuth();
    const [status, setStatus] = useState('loading'); // loading, active, none
    const [subDetails, setSubDetails] = useState(null);
    const [randomCta, setRandomCta] = useState('');

    useEffect(() => {
        // Pick a random CTA message once on mount
        const randomIndex = Math.floor(Math.random() * ctaMessages.length);
        setRandomCta(ctaMessages[randomIndex]);

        const checkStatus = async () => {
            if (user) {
                const snap = await getDoc(doc(db, "users", user.uid));
                if (snap.exists()) {
                    const data = snap.data();
                    if (data.isPremium) {
                        setStatus('active');
                        setSubDetails(data);
                    } else {
                        setStatus('none');
                    }
                }
            } else {
                setStatus('none');
            }
        };
        checkStatus();
    }, [user]);

    const initialOptions = {
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
        currency: "USD",
        intent: "subscription",
        vault: true,
    };

    const handleCancel = async () => {
        if (confirm("Are you sure? You will lose access at the end of this billing period.")) {
            await cancelSubscription();
            alert("Subscription cancelled. No further charges will be made.");
            onClose();
        }
    };

    const handleRefund = async () => {
        if (confirm("Refunds are only available within 7 days of purchase. Proceed?")) {
            await requestRefund();
            alert("Refund processed successfully. Access revoked.");
            setStatus('none');
            onClose();
        }
    };

    if (status === 'active') { // Show Manage Subscription View
        return (
            <div className="full-screen flex-center" style={{ flexDirection: 'column', background: '#0a0a0a', padding: '30px' }}>
                <ShieldCheck size={64} color="var(--bro-green)" style={{ marginBottom: '20px' }} />
                <h1 style={{ color: 'white', marginBottom: '10px' }}>Premium Active</h1>
                <p style={{ color: '#ccc', marginBottom: '30px' }}>You are a Pro member.</p>

                <div className="glass-panel" style={{ width: '100%', padding: '20px', marginBottom: '20px' }}>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Status</p>
                    <p style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {subDetails?.subscriptionStatus?.toUpperCase() || 'ACTIVE'}
                    </p>
                    {subDetails?.currentPeriodEnd && (
                        <>
                            <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '10px' }}>Renews / Expires</p>
                            <p style={{ color: 'white' }}>{subDetails.currentPeriodEnd.toDate().toDateString()}</p>
                        </>
                    )}
                </div>

                <button onClick={handleCancel} style={{ background: 'transparent', border: '1px solid #555', color: '#ccc', padding: '12px', borderRadius: '8px', width: '100%', marginBottom: '10px' }}>
                    Cancel Subscription
                </button>

                <button onClick={handleRefund} style={{ background: 'transparent', border: 'none', color: '#888', textDecoration: 'underline', fontSize: '0.9rem' }}>
                    Request Refund
                </button>

                <button onClick={onClose} style={{ marginTop: '30px', background: 'transparent', border: 'none', color: 'white' }}>
                    Close
                </button>
            </div>
        );
    }

    // Default Paywall View
    return (
        <div className="full-screen flex-center" style={{ flexDirection: 'column', background: '#0a0a0a', padding: '30px', overflowY: 'auto' }}>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--bro-green)', marginBottom: '10px' }}>{t('paywallTitle')}</h1>
            <p style={{ color: '#888', marginBottom: '30px', textAlign: 'center' }}>{t('paywallDesc')}</p>

            {/* Random CTA Banner */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(0,255,136,0.1), rgba(0,100,255,0.1))',
                border: '1px solid rgba(0,255,136,0.3)',
                padding: '15px 20px',
                borderRadius: '12px',
                width: '100%',
                marginBottom: '20px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0, 255, 136, 0.1)'
            }}>
                <p style={{ color: 'white', fontSize: '0.95rem', fontWeight: '500', lineHeight: '1.4' }}>
                    {randomCta}
                </p>
            </div>

            <div className="glass-panel" style={{ padding: '20px', width: '100%', marginBottom: '30px' }}>
                <Benefit text={t('benefit1')} />
                <Benefit text={t('benefit2')} />
                <Benefit text={t('benefit3')} />
                <Benefit text={t('benefit4')} />
            </div>

            <div style={{ width: '100%', zIndex: 100 }}>
                <PayPalScriptProvider options={initialOptions}>
                    <PayPalButtons
                        style={{ layout: "vertical", color: "blue", shape: "pill", label: "subscribe" }}
                        createSubscription={(data, actions) => {
                            const planId = import.meta.env.VITE_PAYPAL_PLAN_ID;
                            if (!planId) {
                                // Fallback for local testing or misconfiguration: 
                                // We simulate a successful subscription ID if no plan is configured
                                console.warn("No VITE_PAYPAL_PLAN_ID set. Simulating subscription.");
                                return Promise.resolve('I-SIMULATED-SUB-ID-123');
                            }
                            return actions.subscription.create({
                                'plan_id': planId
                            });
                        }}
                        onApprove={(data, actions) => {
                            setPremium(data.subscriptionID || 'I-SIMULATED-SUB-ID-123');
                            onSuccess();
                        }}
                        onError={(err) => {
                            console.error("PayPal Error:", err);
                            alert("Oops! There was an issue with PayPal. Please try again.");
                        }}
                    />
                </PayPalScriptProvider>
            </div>

            <div style={{ marginTop: '30px', borderTop: '1px solid #333', paddingTop: '20px', width: '100%' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#666', fontSize: '0.8rem', marginBottom: '10px' }}>
                    <AlertCircle size={16} />
                    <span>Automated Cancellation & Refund Available</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#555', lineHeight: '1.4' }}>
                    By subscribing, you agree to our Terms. You can cancel anytime in the app settings.
                    Refunds are automatically processed if requested within 7 days.
                </p>
            </div>

            {onClose && (
                <button onClick={onClose} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#666', padding: '10px', width: '100%' }}>
                    Maybe Later
                </button>
            )}
        </div>
    );
};

const Benefit = ({ text }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{ background: 'rgba(0,255,136,0.2)', padding: '5px', borderRadius: '50%' }}>
            <Check size={16} color="var(--bro-green)" />
        </div>
        <span style={{ fontSize: '0.95rem' }}>{text}</span>
    </div>
);

export default Paywall;
