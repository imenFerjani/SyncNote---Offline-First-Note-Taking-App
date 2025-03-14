import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EmptyState = ({ message, icon = 'document-text-outline' }) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color="#BDBDBD" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
});

export default EmptyState;