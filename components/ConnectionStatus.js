import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text,
  Animated,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ConnectionStatus = ({ isOnline }) => {
  const { width } = useWindowDimensions();
  
  // Show banner only when offline
  if (isOnline) return null;
  
  return (
    <View style={[styles.container, { width }]}>
      <Ionicons name="cloud-offline" size={16} color="white" />
      <Text style={styles.text}>You are offline. Changes will sync when you reconnect.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F57C00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  text: {
    color: 'white',
    marginLeft: 8,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ConnectionStatus;