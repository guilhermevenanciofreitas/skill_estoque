import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Animated, SafeAreaView } from 'react-native';
import ProdutoList from './produto';
import LocalList from './local';

const App = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerAnimation] = useState(new Animated.Value(-250));
  const [selectedScreen, setSelectedScreen] = useState('Produto');

  const toggleDrawer = () => {
    Animated.timing(drawerAnimation, {
      toValue: isDrawerOpen ? -250 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();

    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleOutsidePress = () => {
    if (isDrawerOpen) {
      toggleDrawer();
    }
  };

  const handleMenuItemClick = (screen) => {
    setSelectedScreen(screen);
    toggleDrawer();
  };

  const renderContent = () => {

    switch (selectedScreen) {
      case "Produto":
        return <ProdutoList />
      case "Local":
        return <LocalList />
    }

    return <Text style={styles.bodyText}>Conteúdo de {selectedScreen}</Text>;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Fechar menu ao tocar fora */}
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View style={[styles.overlay, isDrawerOpen && styles.overlayVisible]} />
      </TouchableWithoutFeedback>

      {/* Menu Lateral */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnimation }] }]}>
        <View style={styles.drawerContent}>
          <TouchableOpacity onPress={() => handleMenuItemClick('Produto')}>
            <Text style={styles.drawerItem}>Produto</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleMenuItemClick('Local')}>
            <Text style={styles.drawerItem}>Local</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Conteúdo Principal */}
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleDrawer}>
            <Text style={styles.menuButton}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{selectedScreen}</Text>
        </View>
        <View style={styles.body}>{renderContent()}</View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: 0,
  },
  overlayVisible: {
    zIndex: 1,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: '#ffffff',
    paddingTop: 50,
    zIndex: 2,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 2, height: 2 },
  },
  drawerContent: {
    padding: 20,
  },
  drawerItem: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10, // Reduzi a altura do cabeçalho
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuButton: {
    fontSize: 30,
    color: '#333',
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    color: '#333',
    fontWeight: '600',
  },
  body: {
    flex: 1,
    padding: 20, // Mantendo espaçamento no conteúdo, sem afetar o header
  },
  bodyText: {
    fontSize: 18,
    color: '#333',
  },
});

export default App;
