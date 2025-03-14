import React, { useState, useContext, useEffect, useLayoutEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import ConnectionStatus from '../components/ConnectionStatus';

const NoteScreen = ({ route, navigation }) => {
  const { noteId } = route.params || {};
  const { notes, addNote, updateNote, deleteNote, isLoading, isOnline } = useContext(AppContext);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Find note if editing an existing one
  useEffect(() => {
    if (noteId) {
      const foundNote = notes.find(n => n.id === noteId);
      if (foundNote) {
        setTitle(foundNote.title);
        setContent(foundNote.content);
      }
    }
  }, [noteId, notes]);

  // Set up header buttons
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          {noteId && (
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={24} color="white" />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={handleSave}
            disabled={isSaving || (!title && !content)}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="save-outline" size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, title, content, noteId, isSaving]);

  // Prompt user if they try to leave with unsaved changes
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!unsavedChanges) return;

      // Prevent default behavior of leaving the screen
      e.preventDefault();

      // Prompt the user before leaving the screen
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: "Don't leave", style: 'cancel', onPress: () => {} },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, unsavedChanges]);

  // Track unsaved changes
  useEffect(() => {
    if (noteId) {
      const foundNote = notes.find(n => n.id === noteId);
      setUnsavedChanges(
        foundNote && (foundNote.title !== title || foundNote.content !== content)
      );
    } else {
      setUnsavedChanges(title !== '' || content !== '');
    }
  }, [title, content, noteId, notes]);

  // Save note handler
  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Cannot Save', 'Please enter a title or content for your note');
      return;
    }

    try {
      setIsSaving(true);
      
      if (noteId) {
        // Update existing note
        updateNote(noteId, title, content);
      } else {
        // Create new note
        addNote(title, content);
      }
      
      // Show offline warning if not connected
      if (!isOnline) {
        Alert.alert(
          'Saved Offline',
          'Your note has been saved locally and will sync when you reconnect to the internet.'
        );
      }
      
      setUnsavedChanges(false);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save note. Please try again.');
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete note handler
  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            deleteNote(noteId);
            navigation.goBack();
          } 
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ConnectionStatus isOnline={isOnline} />
      
      <ScrollView style={styles.scrollContainer}>
        <TextInput
          style={styles.titleInput}
          placeholder="Note Title"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />
        
        <TextInput
          style={styles.contentInput}
          placeholder="Write your note here..."
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
      
      {/* Float Action Button for quick save */}
      {unsavedChanges && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleSave}
          disabled={isSaving || (!title && !content)}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="save" size={24} color="white" />
          )}
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    padding: 8,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 300,
    padding: 8,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginHorizontal: 8,
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default NoteScreen;