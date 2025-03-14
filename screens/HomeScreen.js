import React, { useContext, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AppContext } from '../context/AppContext';
import NoteCard from '../components/NoteCard';
import EmptyState from '../components/EmptyState';
import ConnectionStatus from '../components/ConnectionStatus';

const HomeScreen = ({ navigation }) => {
  const { 
    notes, 
    isLoading, 
    isOnline, 
    pendingSync, 
    syncNotesToServer,
    lastSynced 
  } = useContext(AppContext);

  const [refreshing, setRefreshing] = useState(false);

  // Refresh notes data
  const onRefresh = async () => {
    setRefreshing(true);
    await syncNotesToServer();
    setRefreshing(false);
  };

  // Format the date for display
  const formatLastSynced = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Handle navigation to sync screen
  const handleSyncPress = () => {
    navigation.navigate('Sync');
  };

  return (
    <View style={styles.container}>
      <ConnectionStatus isOnline={isOnline} />
      
      <View style={styles.headerContainer}>
        <Text style={styles.pendingText}>
          {pendingSync.length > 0 
            ? `${pendingSync.length} change${pendingSync.length > 1 ? 's' : ''} pending sync` 
            : 'All changes synced'}
        </Text>
        <TouchableOpacity 
          style={[
            styles.syncButton,
            (!isOnline || pendingSync.length === 0) && styles.syncButtonDisabled
          ]}
          onPress={handleSyncPress}
          disabled={!isOnline || pendingSync.length === 0}
        >
          <Ionicons name="sync" size={16} color="white" />
          <Text style={styles.syncButtonText}>Sync</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.lastSyncedText}>
        Last synced: {formatLastSynced(lastSynced)}
      </Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading notes...</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NoteCard
              note={item}
              onPress={() => navigation.navigate('Note', { noteId: item.id, title: item.title })}
            />
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<EmptyState message="No notes yet. Create your first note!" />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6200ee']} />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Note')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  pendingText: {
    fontSize: 14,
    color: '#757575',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  syncButtonDisabled: {
    backgroundColor: '#bbb',
  },
  syncButtonText: {
    color: 'white',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  lastSyncedText: {
    fontSize: 12,
    color: '#757575',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default HomeScreen;