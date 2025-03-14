import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';
import uuid from 'react-native-uuid';

// Create context
export const AppContext = createContext();

// Mock API service - in a real app, replace with actual API endpoints
const mockApiService = {
  syncNotes: async (notes) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true, message: 'Notes synced successfully' };
  },
};

export const AppProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [pendingSync, setPendingSync] = useState([]);
  const [lastSynced, setLastSynced] = useState(null);

  // Load notes from AsyncStorage on startup
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const storedNotes = await AsyncStorage.getItem('notes');
        const storedPendingSync = await AsyncStorage.getItem('pendingSync');
        const storedLastSynced = await AsyncStorage.getItem('lastSynced');
        
        if (storedNotes) {
          setNotes(JSON.parse(storedNotes));
        }
        
        if (storedPendingSync) {
          setPendingSync(JSON.parse(storedPendingSync));
        }
        
        if (storedLastSynced) {
          setLastSynced(JSON.parse(storedLastSynced));
        }
      } catch (error) {
        console.error('Failed to load notes from storage', error);
        Alert.alert('Error', 'Failed to load your notes');
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, []);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected && state.isInternetReachable);
      
      // Attempt to sync when connection is restored
      if (state.isConnected && state.isInternetReachable && pendingSync.length > 0) {
        syncNotesToServer();
      }
    });

    // Initial check
    NetInfo.fetch().then(state => {
      setIsOnline(state.isConnected && state.isInternetReachable);
    });

    return () => unsubscribe();
  }, [pendingSync]);

  // Save notes to AsyncStorage whenever they change
  useEffect(() => {
    const saveNotes = async () => {
      try {
        await AsyncStorage.setItem('notes', JSON.stringify(notes));
      } catch (error) {
        console.error('Failed to save notes to storage', error);
      }
    };

    if (notes.length > 0 || notes.length === 0) {
      saveNotes();
    }
  }, [notes]);

  // Save pending sync queue to AsyncStorage
  useEffect(() => {
    const savePendingSync = async () => {
      try {
        await AsyncStorage.setItem('pendingSync', JSON.stringify(pendingSync));
      } catch (error) {
        console.error('Failed to save pending sync queue', error);
      }
    };

    savePendingSync();
  }, [pendingSync]);

  // Save last synced timestamp
  useEffect(() => {
    const saveLastSynced = async () => {
      try {
        await AsyncStorage.setItem('lastSynced', JSON.stringify(lastSynced));
      } catch (error) {
        console.error('Failed to save last synced timestamp', error);
      }
    };

    if (lastSynced) {
      saveLastSynced();
    }
  }, [lastSynced]);

  // Add a note
  const addNote = useCallback((title, content) => {
    const newNote = {
      id: uuid.v4(),
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      synced: false,
    };

    setNotes(prevNotes => [...prevNotes, newNote]);
    setPendingSync(prev => [...prev, { action: 'create', note: newNote }]);
  }, []);

  // Update a note
  const updateNote = useCallback((id, title, content) => {
    setNotes(prevNotes => {
      const updatedNotes = prevNotes.map(note => {
        if (note.id === id) {
          const updatedNote = { 
            ...note, 
            title, 
            content, 
            updatedAt: new Date().toISOString(),
            synced: false 
          };
          
          // Queue for sync
          setPendingSync(prev => [
            ...prev.filter(item => !(item.action === 'update' && item.note.id === id)),
            { action: 'update', note: updatedNote }
          ]);
          
          return updatedNote;
        }
        return note;
      });
      
      return updatedNotes;
    });
  }, []);

  // Delete a note
  const deleteNote = useCallback((id) => {
    const noteToDelete = notes.find(note => note.id === id);
    
    if (noteToDelete) {
      setPendingSync(prev => [
        ...prev.filter(item => item.note.id !== id),
        { action: 'delete', note: noteToDelete }
      ]);
    }
    
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  }, [notes]);

  // Sync notes to server
  const syncNotesToServer = useCallback(async () => {
    if (pendingSync.length === 0) {
      return { success: true, message: 'Nothing to sync' };
    }

    if (!isOnline) {
      return { success: false, message: 'You are offline. Changes will sync when connection is restored.' };
    }

    try {
      setIsLoading(true);
      
      // Call the mock API service to sync notes
      const result = await mockApiService.syncNotes(pendingSync);
      
      if (result.success) {
        // Mark all notes as synced
        setNotes(prevNotes => 
          prevNotes.map(note => ({ ...note, synced: true }))
        );
        
        // Clear the pending sync queue
        setPendingSync([]);
        
        // Update last synced timestamp
        const now = new Date().toISOString();
        setLastSynced(now);
        
        return result;
      } else {
        throw new Error(result.message || 'Sync failed');
      }
    } catch (error) {
      console.error('Failed to sync notes', error);
      return { 
        success: false, 
        message: error.message || 'Failed to sync notes. Please try again later.' 
      };
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, pendingSync]);

  // Clear all data (for testing/debugging)
  const clearAllData = useCallback(async () => {
    try {
      await AsyncStorage.clear();
      setNotes([]);
      setPendingSync([]);
      setLastSynced(null);
      return true;
    } catch (error) {
      console.error('Failed to clear data', error);
      return false;
    }
  }, []);

  // Context value
  const contextValue = {
    notes,
    isLoading,
    isOnline,
    pendingSync,
    lastSynced,
    addNote,
    updateNote,
    deleteNote,
    syncNotesToServer,
    clearAllData,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};