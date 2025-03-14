import React, { useContext, useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import ConnectionStatus from '../components/ConnectionStatus';

const SyncScreen = ({ navigation }) => {
  const { 
    pendingSync, 
    isOnline, 
    syncNotesToServer, 
    lastSynced,
    clearAllData 
  } = useContext(AppContext);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  // Format the date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format action type for display
  const formatAction = (action) => {
    switch (action) {
      case 'create':
        return 'Create';
      case 'update':
        return 'Update';
      case 'delete':
        return 'Delete';
      default:
        return action;
    }
  };

  // Handle sync button press
  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert(
        'No Connection',
        'You are currently offline. Please connect to the internet to sync your notes.'
      );
      return;
    }

    setIsSyncing(true);
    setSyncResult(null);
    
    try {
      const result = await syncNotesToServer();
      setSyncResult(result);
      
      if (result.success) {
        // Success alert
        Alert.alert('Sync Complete', result.message);
      } else {
        // Error alert
        Alert.alert('Sync Failed', result.message);
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncResult({
        success: false,
        message: 'An unexpected error occurred during sync.'
      });
      
      Alert.alert('Sync Error', 'An unexpected error occurred during sync.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle debug/reset data
  const handleClearData = () => {
    Alert.alert(
      'Reset App Data',
      'This will delete all your notes and sync data. This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive', 
          onPress: async () => {
            const success = await clearAllData();
            if (success) {
              Alert.alert('Success', 'All data has been reset.');
              navigation.navigate('Home');
            } else {
              Alert.alert('Error', 'Failed to reset data. Please try again.');
            }
          } 
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ConnectionStatus isOnline={isOnline} />
      
      <View style={styles.syncInfo}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Connection Status</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: isOnline ? '#4CAF50' : '#F44336' }]} />
            <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Last Sync</Text>
          <Text style={styles.infoValue}>{formatDate(lastSynced)}</Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Pending Changes</Text>
          <Text style={styles.infoValue}>{pendingSync.length}</Text>
        </View>
      </View>
      
      {pendingSync.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Pending Changes</Text>
          <FlatList
            data={pendingSync}
            keyExtractor={(item, index) => `${item.note.id}-${index}`}
            renderItem={({ item }) => (
              <View style={styles.pendingItem}>
                <View style={styles.pendingItemHeader}>
                  <View style={[styles.actionBadge, {
                    backgroundColor: 
                      item.action === 'create' ? '#4CAF50' : 
                      item.action === 'update' ? '#2196F3' : '#F44336'
                  }]}>
                    <Text style={styles.actionText}>{formatAction(item.action)}</Text>
                  </View>
                  <Text style={styles.pendingDate}>
                    {new Date(item.note.updatedAt).toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.pendingTitle} numberOfLines={1}>
                  {item.note.title || 'Untitled Note'}
                </Text>
              </View>
            )}
            contentContainerStyle={styles.listContainer}
          />
        </>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle-outline" size={64} color="#4CAF50" />
          <Text style={styles.emptyStateText}>All notes are synced</Text>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.syncButton,
            (!isOnline || pendingSync.length === 0) && styles.syncButtonDisabled
          ]}
          onPress={handleSync}
          disabled={!isOnline || pendingSync.length === 0 || isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="sync" size={18} color="white" />
              <Text style={styles.buttonText}>Sync Now</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleClearData}
        >
          <Ionicons name="trash-outline" size={18} color="white" />
          <Text style={styles.buttonText}>Reset App Data</Text>
        </TouchableOpacity>
      </View>
      
      {syncResult && (
        <View style={[
          styles.resultCard,
          { backgroundColor: syncResult.success ? '#E8F5E9' : '#FFEBEE' }
        ]}>
          <Ionicons 
            name={syncResult.success ? 'checkmark-circle' : 'alert-circle'} 
            size={24} 
            color={syncResult.success ? '#4CAF50' : '#F44336'} 
          />
          <Text style={styles.resultText}>{syncResult.message}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  syncInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#212121',
  },
  listContainer: {
    flexGrow: 1,
  },
  pendingItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pendingItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pendingDate: {
    fontSize: 12,
    color: '#757575',
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#757575',
    marginTop: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    marginRight: 8,
  },
  syncButtonDisabled: {
    backgroundColor: '#bbb',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  resultText: {
    marginLeft: 8,
    flex: 1,
  },
});

export default SyncScreen;