import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const backgroundColor = '#fff';
  const textColor = '#333';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Settings</Text>
      <View style={styles.settingItem}>
        <Text style={[styles.settingText, { color: textColor }]}>
          Enable Notifications
        </Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={(value) => setNotificationsEnabled(value)}
        />
      </View>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>About</Text>
        <Text style={[styles.sectionContent, { color: textColor }]}>
          This app is designed to help you manage your tasks efficiently, track your progress, and stay organized.
        </Text>
      </View>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Contact Us</Text>
        <Text style={[styles.sectionContent, { color: textColor }]}>
          moin.shaikh2684@gmail.com
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 30,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
    alignItems: 'center',
  },
  settingText: {
    fontSize: 18,
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 22,
  },
});
