import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ClaudePP PDV Mobile</Text>
      <Text style={styles.subtitle}>Sistema PDV Híbrido Enterprise</Text>
      <Text style={styles.status}>✅ Mobile App inicializado com sucesso!</Text>
      <Text style={styles.version}>Versão 0.1.0 - Fase 1: Configuração Base</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    color: '#10b981',
    marginBottom: 12,
  },
  version: {
    fontSize: 12,
    color: '#999',
  },
});
