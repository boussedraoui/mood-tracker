import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, Modal, FlatList, 
  SafeAreaView, Image, ScrollView, Alert 
} from 'react-native';

const I18n = {
  en: {
    title: 'Daily Mood Tracker', mood: 'Mood:', activity: 'Activity:', save: 'Save',
    insights: 'Weekly Insights', trend: 'Weekly Trend:', recs: 'Recommendations:',
    subscribe: 'Subscribe ($4.99/mo)', entries: 'Entries:', download: 'Download', share: 'Share',
    info_title: 'About This App', info_text: 'Track your daily mood and activities to improve your mental health.',
    lang_btn: 'English', download_warning: 'Subscribe to unlock downloads'
  },
  ar: {
    title: 'متتبع المزاج اليومي', mood: 'المزاج:', activity: 'النشاط:', save: 'حفظ',
    insights: 'رؤى أسبوعية', trend: 'اتجاه الأسبوع:', recs: 'توصيات:',
    subscribe: 'اشتراك ($4.99/شهر)', entries: 'المدخلات:', download: 'تحميل', share: 'مشاركة',
    info_title: 'حول التطبيق', info_text: 'تتبع مزاجك وأنشطتك اليومية لتحسين صحتك النفسية.',
    lang_btn: 'العربية', download_warning: 'اشترك لتفعيل التحميل'
  }
};

const DEFAULT_LANG = 'en';
const LANG_LIST = [ { code: 'en', name: 'English' }, { code: 'ar', name: 'العربية' } ]; // Add more languages as needed

const recommendationData = [ { text: "Drink a glass of water.", icon: "💧" }, { text: "Take a 5-minute break.", icon: "🧘" }, { text: "Call a friend to chat.", icon: "📞" }, { text: "Go for a short walk.", icon: "🚶" }, { text: "Listen to your favorite song.", icon: "🎵" }, { text: "Try a breathing exercise.", icon: "🌿" }, { text: "Write down 3 things you are grateful for.", icon: "📝" }, { text: "Do some quick stretches.", icon: "🤸" }, { text: "Read a few pages of a book.", icon: "📖" }, { text: "Meditate for 2 minutes.", icon: "🕯️" } ];

const statThemes = [ { icon: "🚀", color: "#4CAF50" }, { icon: "🌟", color: "#2196F3" }, { icon: "🎯", color: "#FF9800" }, { icon: "💪", color: "#8BC34A" }, { icon: "⚡", color: "#FFC107" }, { icon: "🌞", color: "#FF5722" } ];

export default function App() {
  const [mood, setMood] = useState(null);
  const [activity, setActivity] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [entries, setEntries] = useState([]);
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  const [currentRec, setCurrentRec] = useState(recommendationData[0]);
  const [currentTheme, setCurrentTheme] = useState(statThemes[0]);
  const [weeklyStatText, setWeeklyStatText] = useState("Start tracking!");

  const [selectedLang, setSelectedLang] = useState(DEFAULT_LANG);
  const [hasSelectedLang, setHasSelectedLang] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const timerRef = useRef(null);

  const [paypalModalVisible, setPaypalModalVisible] = useState(false);

  // YOUR EXACT PAYPAL CREDENTIALS FROM THE DASHBOARD
  const PAYPAL_CLIENT_ID = "AV2UKMpbf8suLviBQRBw-wFWoreeDlF74RdNWpnSzFXhVuadtMAKw4ukv6bftV3o6lcTEiBRQLRikvIN";
  const PAYPAL_PLAN_ID = "P-00P45881CJ9839056NJKUXLQ";
  const PAYPAL_BUTTON_ID = "paypal-button-container-P-00P45881CJ9839056NJKUXLQ";

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      if (!hasSelectedLang) { setHasSelectedLang(true); }
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

  useEffect(() => {
    loadEntries();
    checkSubscription();
  }, []);

  useEffect(() => {
    if (entries.length === 0) {
      setWeeklyStatText("No data this week.");
      setCurrentRec(recommendationData[Math.floor(Math.random() * recommendationData.length)]);
      setCurrentTheme(statThemes[Math.floor(Math.random() * statThemes.length)]);
      return;
    }
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= sevenDaysAgo;
    });
    if (weekEntries.length === 0) {
      setWeeklyStatText("No entries this week");
    } else {
      const moodCounts = {};
      weekEntries.forEach(e => {
        moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      });
      let mostFrequent = '...';
      let maxCount = 0;
      for (const [mood, count] of Object.entries(moodCounts)) {
        if (count > maxCount) {
          maxCount = count;
          mostFrequent = mood;
        }
      }
      setWeeklyStatText(`Most frequent: ${mostFrequent} (${maxCount} days)`);
    }
    const randomRec = recommendationData[Math.floor(Math.random() * recommendationData.length)];
    const randomTheme = statThemes[Math.floor(Math.random() * statThemes.length)];
    setCurrentRec(randomRec);
    setCurrentTheme(randomTheme);
  }, [entries]);

  const checkSubscription = () => {
    const expiry = localStorage.getItem('subExpiry');
    if (expiry) {
      const now = new Date().getTime();
      if (now < parseInt(expiry)) {
        setIsSubscribed(true);
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
    setPaypalModalVisible(true);
  };

  // Load the PayPal SDK dynamically
  useEffect(() => {
    if (paypalModalVisible && window.paypal === undefined) {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
      script.async = true;
      script.onload = () => renderPayPalButton();
      document.body.appendChild(script);
    } else if (paypalModalVisible && window.paypal) {
      setTimeout(() => renderPayPalButton(), 100);
    }
  }, [paypalModalVisible]);

  const renderPayPalButton = () => {
    const container = document.getElementById(PAYPAL_BUTTON_ID);
    if (!container) return;
    container.innerHTML = '';

    if (window.paypal && window.paypal.Buttons) {
      window.paypal.Buttons({
        style: { shape: 'rect', color: 'gold', layout: 'vertical', label: 'subscribe' },
        createSubscription: function(data, actions) {
          return actions.subscription.create({
            plan_id: PAYPAL_PLAN_ID
          });
        },
        onApprove: function(data, actions) {
          // Automatically unlock the app when payment succeeds
          const now = new Date().getTime();
          const expiry = now + 30 * 24 * 60 * 60 * 1000;
          localStorage.setItem('subExpiry', expiry.toString());
          setIsSubscribed(true);
          setPaypalModalVisible(false);
          Alert.alert('Success!', 'Your $4.99/month subscription is now active.');
        },
        onCancel: function(data) {
          Alert.alert('Cancelled', 'You cancelled the subscription.');
        },
        onError: function(err) {
          console.error('PayPal Error:', err);
        }
      }).render(`#${PAYPAL_BUTTON_ID}`);
    }
  };

  const handleDownload = () => {
    if (!isSubscribed) {
      Alert.alert('Locked', t.download_warning);
      return;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });

    if (monthlyEntries.length === 0) {
      Alert.alert('No Data', 'No entries found for this month.');
      return;
    }

    const dataStr = JSON.stringify(monthlyEntries, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mood_stats_${currentYear}_${currentMonth + 1}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!hasSelectedLang) {
    return (
      <SafeAreaView style={styles.languageContainer}>
        <Image source={require('./assets/1783351665167.jpg')} style={styles.appIcon} />
        <Text style={styles.appNameText}>Mood Tracker</Text>
        <TouchableOpacity style={styles.langButton} onPress={handleToggleLanguageModal}>
          <Text style={styles.langButtonText}>{t.lang_btn}</Text>
        </TouchableOpacity>
        <Text style={styles.autoEnterText}>Entering in 3 seconds...</Text>
        <Modal animationType="fade" transparent={true} visible={langModalVisible} onRequestClose={() => setLangModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choose Language</Text>
              <FlatList data={LANG_LIST} keyExtractor={(item) => item.code} renderItem={({ item }) => (
                  <TouchableOpacity style={styles.langItem} onPress={() => handleSelectLanguage(item.code)}>
                    <Text style={styles.langItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )} />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

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

        <View style={[styles.card, { borderLeftWidth: 6, borderLeftColor: currentTheme.color }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{currentTheme.icon} {t.insights}</Text>
            <Text style={styles.freeBadge}>{isSubscribed ? 'Premium' : 'Free'}</Text>
          </View>
          <Text style={styles.cardText}>{t.trend} {weeklyStatText}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardTextSmall}>{t.recs} {currentRec.icon} {currentRec.text}</Text>
            <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribePress}>
              <Text style={styles.subscribeText}>{t.subscribe}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.entriesCount}>{t.entries} {entries.length}</Text>
          <View style={styles.footerButtons}>
            <TouchableOpacity style={[styles.greenBtn, !isSubscribed && styles.disabledBtn]} onPress={handleDownload}>
              <Text style={styles.btnText}>{t.download}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.blueBtn}>
              <Text style={styles.btnText}>{t.share}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {!isSubscribed && <Text style={styles.downloadWarningText}>{t.download_warning}</Text>}

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

        {/* --- REAL PAYPAL SUBSCRIPTION MODAL --- */}
        <Modal visible={paypalModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t.pay_title || "Subscribe via PayPal"}</Text>
              <Text style={styles.modalBody}>{t.pay_desc || "Secure monthly recurring payment."}</Text>
              
              {/* The PayPal Smart Button container with your exact ID */}
              <View id={PAYPAL_BUTTON_ID} style={{ width: '100%', marginVertical: 15, minHeight: 50 }}></View>

              <TouchableOpacity style={styles.closeButton} onPress={() => setPaypalModalVisible(false)}>
                <Text style={styles.closeText}>{t.pay_cancel || "Cancel"}</Text>
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
  cardTextSmall: { fontSize: 14, fontWeight: '500', color: '#2c3e50', flex: 1, marginRight: 10 },
  subscribeButton: { backgroundColor: '#f39c12', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
  subscribeText: { color: '#fff', fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginTop: 10 },
  entriesCount: { fontSize: 16, color: '#7f8c8d' },
  footerButtons: { flexDirection: 'row' },
  greenBtn: { backgroundColor: '#2ecc71', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5, marginRight: 10 },
  blueBtn: { backgroundColor: '#3498db', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  disabledBtn: { backgroundColor: '#95a5a6', opacity: 0.7 },
  downloadWarningText: { fontSize: 12, color: '#e74c3c', marginTop: 5, alignSelf: 'center' },
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
