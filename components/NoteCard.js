import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NoteCard = ({ note, onPress }) => {
  // Format the date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return 'Unknown date';
    }
  };

  // Extract a preview from the content
  const getContentPreview = (content) => {
    if (!content) return '';
    return content.length > 100 ? `${content.slice(0, 100)}...` : content;
  };

  return (
    <TouchableOpacity 
      style={[styles.card, !note.synced && styles.unsyncedCard]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {note.title || 'Untitled Note'}
        </Text>
        {!note.synced && (
          <Ionicons name="cloud-offline-outline" size={18} color="#F57C00" />
        )}
      </View>
      
      <Text style={styles.preview} numberOfLines={2}>
        {getContentPreview(note.content)}
      </Text>
      
      <View style={styles.footer}>
        <Text style={styles.date}>
          {formatDate(note.updatedAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  unsyncedCard: {
    borderLeftColor: '#F57C00',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    flex: 1,
  },
  preview: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#9e9e9e',
  },
});

export default NoteCard;