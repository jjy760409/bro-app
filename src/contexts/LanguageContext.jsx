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
    es: {
        analyzing: "Analizando...",
        scanMore: "Escanear más",
        calories: "Calorías",
        protein: "Proteína",
        carbs: "Carbohidratos",
        fat: "Grasa",
        healthScore: "Puntuación de salud",
        paywallTitle: "Bro Pro",
        paywallDesc: "Desbloquea escaneos ilimitados y análisis de salud detallados.",
        benefit1: "Análisis de alimentos con IA ilimitado",
        benefit2: "Seguimiento macro avanzado",
        benefit3: "Planes de dieta personalizados",
        benefit4: "Sin anuncios",
        subscribeSuccess: "Suscripción exitosa: ",
        mockPayment: "Integración de pago simulada. Use cuentas de Sandbox.",
        legalTitle: "Términos y Privacidad",
        accept: "Acepto",
        cameraError: "Acceso a la cámara denegado o no disponible.",
        tapToCapture: "Toque para capturar",
    },
    fr: {
        analyzing: "Analyse en cours...",
        scanMore: "Scanner plus",
        calories: "Calories",
        protein: "Protéines",
        carbs: "Glucides",
        fat: "Lipides",
        healthScore: "Score santé",
        paywallTitle: "Bro Pro",
        paywallDesc: "Débloquez des scans illimités et des analyses de santé détaillées.",
        benefit1: "Analyse alimentaire IA illimitée",
        benefit2: "Suivi macro avancé",
        benefit3: "Plans de régime personnalisés",
        benefit4: "Pas de publicité",
        subscribeSuccess: "Abonnement réussi : ",
        mockPayment: "Intégration de paiement factice. Utilisez des comptes Sandbox.",
        legalTitle: "Termes et Confidentialité",
        accept: "J'accepte",
        cameraError: "Accès à la caméra refusé ou non disponible.",
        tapToCapture: "Appuyez pour capturer",
    },
    zh: {
        analyzing: "分析中...",
        scanMore: "扫描更多",
        calories: "卡路里",
        protein: "蛋白质",
        carbs: "碳水化合物",
        fat: "脂肪",
        healthScore: "健康评分",
        paywallTitle: "Bro Pro",
        paywallDesc: "解锁无限扫描和详细的健康分析。",
        benefit1: "无限AI食物分析",
        benefit2: "高级宏量追踪",
        benefit3: "个性化饮食计划",
        benefit4: "无广告",
        subscribeSuccess: "订阅成功：",
        mockPayment: "模拟支付集成。请使用沙盒帐户。",
        legalTitle: "条款和隐私",
        accept: "我接受",
        cameraError: "相机访问被拒绝或不可用。",
        tapToCapture: "点击拍摄",
    }
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
