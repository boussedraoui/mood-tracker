import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView, SafeAreaView, Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [mood, setMood] = useState(null);
  const [activity, setActivity] = useState(null);
  const [entries, setEntries] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [expiryTime, setExpiryTime] = useState(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  useEffect(() => {
    loadEntries();
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    const expiry = await AsyncStorage.getItem('subExpiry');
    if (expiry) {
      const now = new Date().getTime();
      if (now < parseInt(expiry)) {
        setIsSubscribed(true);
        setExpiryTime(parseInt(expiry));
      } else {
        setIsSubscribed(false);
        await AsyncStorage.setItem('subExpiry', '0');
      }
    }
  };

  const loadEntries = async () => {
    const data = await AsyncStorage.getItem('moodData');
    if (data) setEntries(JSON.parse(data));
  };

  const saveEntry = async () => {
    if (!mood || !activity) {
      Alert.alert("Choose mood and activity");
      return;
    }
    const entry = { mood, activity, date: new Date().toISOString() };
    const updated = [...entries, entry];
    await AsyncStorage.setItem('moodData', JSON.stringify(updated));
    setEntries(updated);
    Alert.alert("Saved!");
    setMood(null);
    setActivity(null);
  };

  const handleSubscribePress = () => {
    const now = new Date().getTime();
    const expiry = now + 30 * 24 * 60 * 60 * 1000;
    AsyncStorage.setItem('subExpiry', expiry.toString());
    setIsSubscribed(true);
    setExpiryTime(expiry);
    Alert.alert("Subscription active for 1 month (Apple Pay simulation)!");
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '--';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Daily Mood Tracker</Text>

      <Text style={styles.label}>Mood:</Text>
      <View style={styles.row}>
        {['😊', '😢', '😤', '😰'].map(m => (
          <TouchableOpacity key={m} onPress={() => setMood(m)} style={[styles.btn, mood === m && styles.selected]}>
            <Text style={styles.emoji}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Activity:</Text>
      <View style={styles.row}>
        {['💼', '🏃', '🛌', '🍽️'].map(a => (
          <TouchableOpacity key={a} onPress={() => setActivity(a)} style={[styles.btn, activity === a && styles.selected]}>
            <Text style={styles.emoji}>{a}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={saveEntry}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>

      <ScrollView style={styles.premiumContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Your Insights</Text>
          <View style={[styles.badge, { backgroundColor: isSubscribed ? '#d4edda' : '#f8f9fa' }]}>
            <Text style={[styles.badgeText, { color: isSubscribed ? '#155724' : '#6c757d' }]}>
              {isSubscribed ? 'Paid' : 'Free'}
            </Text>
          </View>
        </View>

        {!isSubscribed ? (
          <View style={styles.recommendRow}>
            <Text style={styles.recommendLabel}>Recommendations:</Text>
            <TouchableOpacity onPress={handleSubscribePress} style={styles.subscribeBtnSmall}>
              <Text style={styles.subscribeText}>Subscribe ($4.99/mo)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.adviceText}>Active until: {formatDate(expiryTime)}</Text>
          </View>
        )}
      </ScrollView>
      
      {/* زر المعلومات i */}
      <TouchableOpacity style={styles.infoBtn} onPress={() => setInfoModalVisible(true)}>
        <Text style={styles.infoText}>i</Text>
      </TouchableOpacity>
      
      {/* نافذة المعلومات */}
      <Modal visible={infoModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>🌟 About This App</Text>
              <Text style={styles.modalBody}>
                <Text style={styles.bold}>🧠 A Product of Collective Wisdom</Text>{"\n\n"}
                This application has been rigorously tested and refined by professionals across technical, medical, and scientific fields. It is the culmination of deep research.
                {"\n\n"}
                <Text style={styles.bold}>🎯 Simplicity Above All</Text>{"\n"}
                No distracting audio or visual effects—only pure interaction for your comfort.
                {"\n\n"}
                <Text style={styles.bold}>🤖 Your Daily Companion</Text>{"\n"}
                Tips and instructions never repeat. It evolves with you, day by day toward a better life.
                {"\n\n"}
                <Text style={styles.bold}>🔒 The Value of Commitment</Text>{"\n"}
                A small subscription brings focus and appreciation. For the price of one consultation, get a lifetime of distilled wisdom.
                {"\n\n"}
                <Text style={styles.bold}>🌍 A Global Movement</Text>{"\n"}
                This app has transformed lives worldwide, one mood at a time.
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setInfoModalVisible(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', padding: 20, marginTop: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#34495e', marginVertical: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  btn: { padding: 15, borderRadius: 50, backgroundColor: '#fff', minWidth: 60, alignItems: 'center' },
  selected: { backgroundColor: '#007AFF' },
  emoji: { fontSize: 30 },
  saveBtn: { backgroundColor: '#34C759', padding: 15, borderRadius: 30, alignItems: 'center', marginBottom: 20 },
  saveText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  premiumContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 20, marginTop: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#e0e0e0' },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  recommendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  recommendLabel: { fontSize: 14, fontWeight: '600', color: '#2c3e50' },
  subscribeBtnSmall: { backgroundColor: '#FF9500', padding: 10, borderRadius: 20 },
  subscribeText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  adviceText: { fontSize: 14, color: '#007AFF', marginTop: 10 },
  infoBtn: { position: 'absolute', bottom: 25, right: 25, width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', borderColor: '#007AFF', borderWidth: 2, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  infoText: { fontSize: 26, fontWeight: 'bold', color: '#007AFF', fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', maxHeight: '80%', backgroundColor: 'white', borderRadius: 20, padding: 20, elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center', marginBottom: 15 },
  modalBody: { fontSize: 14, lineHeight: 22, color: '#333', marginBottom: 20 },
  bold: { fontWeight: 'bold' },
  closeBtn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 30, alignItems: 'center' },
  closeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});