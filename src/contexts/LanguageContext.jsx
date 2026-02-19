import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

const translations = {
    en: {
        analyzing: "Analyzing...",
        scanMore: "Scan More",
        calories: "Calories",
        protein: "Protein",
        carbs: "Carbs",
        fat: "Fat",
        healthScore: "Health Score",
        paywallTitle: "Bro Pro",
        paywallDesc: "Unlock unlimited scans and detailed health insights.",
        benefit1: "Unlimited AI Food Analysis",
        benefit2: "Advanced Macro Tracking",
        benefit3: "Personalized Diet Plans",
        benefit4: "No Ads",
        subscribeSuccess: "Subscription successful: ",
        mockPayment: "Mock Payment Integration. Use Sandbox accounts.",
        legalTitle: "Terms & Privacy",
        accept: "I Accept",
        cameraError: "Camera access denied or not available.",
        tapToCapture: "Tap to capture",
    },
    ko: {
        analyzing: "분석 중...",
        scanMore: "다시 촬영하기",
        calories: "칼로리",
        protein: "단백질",
        carbs: "탄수화물",
        fat: "지방",
        healthScore: "건강 점수",
        paywallTitle: "브로 프로(Bro Pro)",
        paywallDesc: "무제한 스캔과 상세한 건강 분석을 잠금 해제하세요.",
        benefit1: "무제한 AI 음식 분석",
        benefit2: "상세 영양소 추적",
        benefit3: "맞춤형 다이어트 플랜",
        benefit4: "광고 없음",
        subscribeSuccess: "구독이 완료되었습니다: ",
        mockPayment: "모의 결제 연동입니다. 샌드박스 계정을 사용하세요.",
        legalTitle: "이용 약관 및 개인정보 처리방침",
        accept: "동의합니다",
        cameraError: "카메라 접근이 거부되었거나 사용할 수 없습니다.",
        tapToCapture: "터치하여 촬영",
    },
    ja: {
        analyzing: "分析中...",
        scanMore: "もう一度スキャン",
        calories: "カロリー",
        protein: "タンパク質",
        carbs: "炭水化物",
        fat: "脂質",
        healthScore: "健康スコア",
        paywallTitle: "Bro Pro",
        paywallDesc: "無制限のスキャンと詳細な健康分析をアンロック。",
        benefit1: "無制限のAI食品分析",
        benefit2: "高度なマクロ追跡",
        benefit3: "パーソナライズされた食事プラン",
        benefit4: "広告なし",
        subscribeSuccess: "登録が完了しました: ",
        mockPayment: "模擬決済統合。サンドボックスアカウントを使用してください。",
        legalTitle: "利用規約とプライバシーポリシー",
        accept: "同意する",
        cameraError: "カメラへのアクセスが拒否されたか、利用できません。",
        tapToCapture: "タップして撮影",
    },
    // We can add more languages similarly (es, fr, de, zh)
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        // Auto-detect browser language
        const browserLang = navigator.language.split('-')[0];
        if (translations[browserLang]) {
            setLanguage(browserLang);
        } else {
            setLanguage('en'); // Fallback
        }
    }, []);

    const t = (key) => {
        return translations[language][key] || translations['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
