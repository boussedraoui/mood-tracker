import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, Modal, FlatList, 
  SafeAreaView, Image, ScrollView, Alert 
} from 'react-native';

// --- 1. Translation Dictionary (Top 12 App Store languages) ---
const I18n = {
  en: {
    title: 'Daily Mood Tracker', mood: 'Mood:', activity: 'Activity:', save: 'Save',
    insights: 'Your Insights', trend: 'Mood Trend:', recs: 'Recommendations:',
    subscribe: 'Subscribe ($4.99/mo)', entries: 'Entries:', download: 'Download', share: 'Share',
    info_title: 'About This App', info_text: 'Track your daily mood and activities to improve your mental health.',
    lang_btn: 'English'
  },
  zh: {
    title: '每日情绪追踪', mood: '心情:', activity: '活动:', save: '保存',
    insights: '你的洞察', trend: '情绪趋势:', recs: '建议:',
    subscribe: '订阅 ($4.99/月)', entries: '记录:', download: '下载', share: '分享',
    info_title: '关于此应用', info_text: '追踪您每天的心情和活动，改善您的心理健康。',
    lang_btn: '中文'
  },
  es: {
    title: 'Rastreador de Estado de Ánimo', mood: 'Estado de ánimo:', activity: 'Actividad:', save: 'Guardar',
    insights: 'Tus perspectivas', trend: 'Tendencia:', recs: 'Recomendaciones:',
    subscribe: 'Suscribirse ($4.99/mes)', entries: 'Entradas:', download: 'Descargar', share: 'Compartir',
    info_title: 'Acerca de', info_text: 'Sigue tu estado de ánimo y actividades diarias.',
    lang_btn: 'Español'
  },
  ar: {
    title: 'متتبع المزاج اليومي', mood: 'المزاج:', activity: 'النشاط:', save: 'حفظ',
    insights: 'رؤيتك', trend: 'اتجاه المزاج:', recs: 'توصيات:',
    subscribe: 'اشتراك ($4.99/شهر)', entries: 'المدخلات:', download: 'تحميل', share: 'مشاركة',
    info_title: 'حول التطبيق', info_text: 'تتبع مزاجك وأنشطتك اليومية لتحسين صحتك النفسية.',
    lang_btn: 'العربية'
  },
  fr: {
    title: 'Suivi d\'Humeur', mood: 'Humeur:', activity: 'Activité:', save: 'Enregistrer',
    insights: 'Vos insights', trend: 'Tendance:', recs: 'Recommandations:',
    subscribe: 'S\'abonner ($4.99/mois)', entries: 'Entrées:', download: 'Télécharger', share: 'Partager',
    info_title: 'À propos', info_text: 'Suivez votre humeur et vos activités quotidiennes.',
    lang_btn: 'Français'
  },
  de: {
    title: 'Stimmungs-Tracker', mood: 'Stimmung:', activity: 'Aktivität:', save: 'Speichern',
    insights: 'Deine Einblicke', trend: 'Stimmungstrend:', recs: 'Empfehlungen:',
    subscribe: 'Abonnieren ($4.99/Monat)', entries: 'Einträge:', download: 'Herunterladen', share: 'Teilen',
    info_title: 'Über diese App', info_text: 'Verfolge deine Stimmung und täglichen Aktivitäten.',
    lang_btn: 'Deutsch'
  },
  ja: {
    title: '毎日の気分トラッカー', mood: '気分:', activity: '活動:', save: '保存',
    insights: 'あなたの洞察', trend: '気分の傾向:', recs: 'おすすめ:',
    subscribe: 'サブスク ($4.99/月)', entries: 'エントリー:', download: 'ダウンロード', share: '共有',
    info_title: 'アプリについて', info_text: '毎日の気分と活動を記録してメンタルヘルスを改善しましょう。',
    lang_btn: '日本語'
  },
  ru: {
    title: 'Трекер настроения', mood: 'Настроение:', activity: 'Активность:', save: 'Сохранить',
    insights: 'Ваши инсайты', trend: 'Тенденция:', recs: 'Рекомендации:',
    subscribe: 'Подписка ($4.99/мес)', entries: 'Записи:', download: 'Скачать', share: 'Поделиться',
    info_title: 'Об этом приложении', info_text: 'Отслеживайте настроение и ежедневные активности.',
    lang_btn: 'Русский'
  },
  pt: {
    title: 'Monitor de Humor', mood: 'Humor:', activity: 'Atividade:', save: 'Salvar',
    insights: 'Seus insights', trend: 'Tendência:', recs: 'Recomendações:',
    subscribe: 'Assinar ($4.99/mês)', entries: 'Entradas:', download: 'Baixar', share: 'Compartilhar',
    info_title: 'Sobre o App', info_text: 'Acompanhe seu humor e atividades diárias.',
    lang_btn: 'Português'
  },
  it: {
    title: 'Monitor Umore', mood: 'Umore:', activity: 'Attività:', save: 'Salva',
    insights: 'I tuoi insight', trend: 'Trend umore:', recs: 'Raccomandazioni:',
    subscribe: 'Abbonati ($4.99/mese)', entries: 'Voci:', download: 'Scarica', share: 'Condividi',
    info_title: 'Informazioni', info_text: 'Traccia il tuo umore e le attività quotidiane.',
    lang_btn: 'Italiano'
  },
  ko: {
    title: '일일 기분 추적기', mood: '기분:', activity: '활동:', save: '저장',
    insights: '당신의 인사이트', trend: '기분 트렌드:', recs: '추천:',
    subscribe: '구독 ($4.99/월)', entries: '기록:', download: '다운로드', share: '공유',
    info_title: '앱 정보', info_text: '일일 기분과 활동을 추적하여 정신 건강을 개선하세요.',
    lang_btn: '한국어'
  },
  hi: {
    title: 'दैनिक मूड ट्रैकर', mood: 'मूड:', activity: 'गतिविधि:', save: 'सहेजें',
    insights: 'आपकी अंतर्दृष्टि', trend: 'मूड रुझान:', recs: 'सिफ़ारिशें:',
    subscribe: 'सदस्यता ($4.99/महीना)', entries: 'प्रविष्टियाँ:', download: 'डाउनलोड', share: 'साझा करें',
    info_title: 'इस ऐप के बारे में', info_text: 'अपने दैनिक मूड और गतिविधियों को ट्रैक करें।',
    lang_btn: 'हिन्दी'
  }
};

const DEFAULT_LANG = 'en';
const LANG_LIST = [
  { code: 'en', name: 'English' }, { code: 'zh', name: '中文' },
  { code: 'es', name: 'Español' }, { code: 'ar', name: 'العربية' },
  { code: 'fr', name: 'Français' }, { code: 'de', name: 'Deutsch' },
  { code: 'ja', name: '日本語' }, { code: 'ru', name: 'Русский' },
  { code: 'pt', name: 'Português' }, { code: 'it', name: 'Italiano' },
  { code: 'ko', name: '한국어' }, { code: 'hi', name: 'हिन्दी' }
];

export default function App() {
  const [mood, setMood] = useState(null);
  const [activity, setActivity] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [expiryTime, setExpiryTime] = useState(null);
  const [entries, setEntries] = useState([]);
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  // Language state
  const [selectedLang, setSelectedLang] = useState(DEFAULT_LANG);
  const [hasSelectedLang, setHasSelectedLang] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (!hasSelectedLang) {
        setHasSelectedLang(true); 
      }
    }, 3000);
    return () => clearTimeout(timerRef.current);
  }, [hasSelectedLang]);

  const handleToggleLanguageModal = () => {
    clearTimeout(timerRef.current);
    setLangModalVisible(!langModalVisible);
  };

  const handleSelectLanguage = (langCode) => {
    clearTimeout(timerRef.current);
    setSelectedLang(langCode);
    setHasSelectedLang(true);
    setLangModalVisible(false);
  };

  const t = I18n[selectedLang] || I18n[DEFAULT_LANG];

  // --- Web-safe localStorage functions ---
  useEffect(() => {
    loadEntries();
    checkSubscription();
  }, []);

  const checkSubscription = () => {
    const expiry = localStorage.getItem('subExpiry');
    if (expiry) {
      const now = new Date().getTime();
      if (now < parseInt(expiry)) {
        setIsSubscribed(true);
        setExpiryTime(parseInt(expiry));
      } else {
        setIsSubscribed(false);
        localStorage.setItem('subExpiry', '0');
      }
    } else {
      setIsSubscribed(false);
      localStorage.setItem('subExpiry', '0');
    }
  };

  const loadEntries = () => {
    const data = localStorage.getItem('moodData');
    if (data) setEntries(JSON.parse(data));
  };

  const saveEntry = () => {
    if (!mood || !activity) {
      Alert.alert('Error', 'Choose mood and activity');
      return;
    }
    const entry = { mood, activity, date: new Date().toISOString() };
    const updated = [...entries, entry];
    localStorage.setItem('moodData', JSON.stringify(updated));
    setEntries(updated);
    Alert.alert('Saved!');
    setMood(null);
    setActivity(null);
  };

  const handleSubscribePress = () => {
    const now = new Date().getTime();
    const expiry = now + 30 * 24 * 60 * 60 * 1000;
    localStorage.setItem('subExpiry', expiry.toString());
    setIsSubscribed(true);
    setExpiryTime(expiry);
    Alert.alert('Subscribed!', 'Subscription active for 1 month (Apple Pay simulation)');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // --- Language Selection Screen ---
  if (!hasSelectedLang) {
    return (
      <SafeAreaView style={styles.languageContainer}>
        <Image source={require('./assets/icon.png')} style={styles.appIcon} />
        <Text style={styles.appNameText}>Mood Tracker</Text>

        <TouchableOpacity style={styles.langButton} onPress={handleToggleLanguageModal}>
          <Text style={styles.langButtonText}>{t.lang_btn}</Text>
        </TouchableOpacity>

        <Text style={styles.autoEnterText}>Entering in 3 seconds...</Text>

        <Modal
          animationType="fade"
          transparent={true}
          visible={langModalVisible}
          onRequestClose={() => setLangModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choose Language</Text>
              <FlatList
                data={LANG_LIST}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.langItem} 
                    onPress={() => handleSelectLanguage(item.code)}
                  >
                    <Text style={styles.langItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // --- Main App ---
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>{t.title}</Text>

        <Text style={styles.label}>{t.mood}</Text>
        <View style={styles.emojisContainer}>
          {['😊', '😢', '😡', '🤒'].map((emo, index) => (
            <TouchableOpacity key={index} onPress={() => setMood(emo)}>
              <Text style={[styles.emoji, mood === emo && styles.selectedEmoji]}>{emo}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>{t.activity}</Text>
        <View style={styles.activitiesContainer}>
          {['💼', '🏃', '🛌', '🍽️'].map((act, index) => (
            <TouchableOpacity key={index} onPress={() => setActivity(act)}>
              <Text style={[styles.emoji, activity === act && styles.selectedEmoji]}>{act}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveEntry}>
          <Text style={styles.saveButtonText}>{t.save}</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t.insights}</Text>
            <Text style={styles.freeBadge}>Free</Text>
          </View>
          <Text style={styles.cardText}>{t.trend} {entries.length > 0 ? 'You need more self-care.' : 'Start tracking!'} 💪</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardTextSmall}>{t.recs}</Text>
            <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribePress}>
              <Text style={styles.subscribeText}>{t.subscribe}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.entriesCount}>{t.entries} {entries.length}</Text>
          <View style={styles.footerButtons}>
            <TouchableOpacity style={styles.greenBtn}>
              <Text style={styles.btnText}>{t.download}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.blueBtn}>
              <Text style={styles.btnText}>{t.share}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.infoButton} onPress={() => setInfoModalVisible(true)}>
          <Text style={styles.infoText}>i</Text>
        </TouchableOpacity>

        <Modal visible={infoModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t.info_title}</Text>
              <Text style={styles.modalBody}>{t.info_text}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setInfoModalVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  languageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  appIcon: { width: 120, height: 120, marginBottom: 20, borderRadius: 25 },
  appNameText: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 40 },
  langButton: { backgroundColor: '#fff', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, borderWidth: 1, borderColor: '#ddd' },
  langButtonText: { fontSize: 18, color: '#333', fontWeight: 'bold' },
  autoEnterText: { marginTop: 20, fontSize: 14, color: '#888' },

  container: { flex: 1, backgroundColor: '#f0f4f8' },
  scrollContainer: { padding: 20, alignItems: 'center', paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2c3e50', marginBottom: 20 },
  label: { fontSize: 18, fontWeight: '600', alignSelf: 'flex-start', marginTop: 10, color: '#34495e' },
  emojisContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginVertical: 15 },
  activitiesContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginVertical: 15 },
  emoji: { fontSize: 40, padding: 10, backgroundColor: '#fff', borderRadius: 50, borderWidth: 2, borderColor: 'transparent' },
  selectedEmoji: { borderColor: '#2ecc71', backgroundColor: '#eafaf1' },
  saveButton: { backgroundColor: '#2ecc71', width: '100%', padding: 15, borderRadius: 10, alignItems: 'center', marginVertical: 15 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  card: { backgroundColor: '#fff', width: '100%', borderRadius: 15, padding: 15, marginVertical: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  freeBadge: { backgroundColor: '#eee', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, fontSize: 12, color: '#555' },
  cardText: { fontSize: 16, color: '#34495e', marginVertical: 10 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  cardTextSmall: { fontSize: 14, fontWeight: '500', color: '#2c3e50' },
  subscribeButton: { backgroundColor: '#f39c12', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
  subscribeText: { color: '#fff', fontWeight: 'bold' },

  footer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginTop: 10 },
  entriesCount: { fontSize: 16, color: '#7f8c8d' },
  footerButtons: { flexDirection: 'row' },
  greenBtn: { backgroundColor: '#2ecc71', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5, marginRight: 10 },
  blueBtn: { backgroundColor: '#3498db', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5 },
  btnText: { color: '#fff', fontWeight: 'bold' },

  infoButton: { position: 'absolute', bottom: 20, right: 20, width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#3498db' },
  infoText: { fontSize: 22, fontWeight: 'bold', color: '#3498db' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#2c3e50' },
  modalBody: { fontSize: 16, textAlign: 'center', color: '#555', marginBottom: 15 },
  closeButton: { backgroundColor: '#e74c3c', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
  closeText: { color: '#fff', fontWeight: 'bold' },

  langItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee', width: '100%', alignItems: 'center' },
  langItemText: { fontSize: 16, color: '#2c3e50' }
});
