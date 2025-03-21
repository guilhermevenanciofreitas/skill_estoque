import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Animated, SafeAreaView 
} from 'react-native';

import { ProdutoList } from './views/cadastros/produto';

import { RelatorioProdutoList } from './views/relatorios/produto';
import { RelatorioLocalList } from './views/relatorios/local';
import { RelatorioResumoList } from './views/relatorios/resumo';

const App = () => {

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerAnimation] = useState(new Animated.Value(-300));
  const [selectedScreen, setSelectedScreen] = useState('Produtos');

  const [cadastrosExpanded, setCadastrosExpanded] = useState(false);
  const [relatoriosExpanded, setRelatoriosExpanded] = useState(false);

  const toggleDrawer = () => {
    Animated.timing(drawerAnimation, {
      toValue: isDrawerOpen ? -300 : 0,
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

  const toggleCadastros = () => {
    setCadastrosExpanded(!cadastrosExpanded);
  };

  const toggleRelatorios = () => {
    setRelatoriosExpanded(!relatoriosExpanded);
  };

  const renderContent = () => {
    switch (selectedScreen) {
      case "Produtos":
        return <ProdutoList />;
      case "Produto":
        return <RelatorioProdutoList />;
      case "Resumo":
        return <RelatorioResumoList />;
      case "Local":
        return <RelatorioLocalList />;
      default:
        return <Text style={styles.bodyText}>Conteúdo de {selectedScreen}</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View style={[styles.overlay, isDrawerOpen && styles.overlayVisible]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnimation }] }]}>
        <View style={styles.drawerContent}>
          
          {/* Cadastros */}
          <TouchableOpacity onPress={toggleCadastros} style={styles.menuItem}>
            <Text style={styles.menuText}>{cadastrosExpanded ? "🔽" : "➡"} Cadastros</Text>
          </TouchableOpacity>
          {cadastrosExpanded && (
            <View style={styles.subMenu}>
              <TouchableOpacity onPress={() => handleMenuItemClick('Produtos')} style={styles.subMenuItem}>
                <Text style={styles.subMenuText}>📦 Produtos</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Relatórios */}
          <TouchableOpacity onPress={toggleRelatorios} style={styles.menuItem}>
            <Text style={styles.menuText}>{relatoriosExpanded ? "🔽" : "➡"} Relatórios</Text>
          </TouchableOpacity>
          {relatoriosExpanded && (
            <View style={styles.subMenu}>
              <TouchableOpacity onPress={() => handleMenuItemClick('Resumo')} style={styles.subMenuItem}>
                <Text style={styles.subMenuText}>📊 Resumo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMenuItemClick('Produto')} style={styles.subMenuItem}>
                <Text style={styles.subMenuText}>📊 Produtos</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleMenuItemClick('Local')} style={styles.subMenuItem}>
                <Text style={styles.subMenuText}>📍 Locais</Text>
              </TouchableOpacity>
            </View>
          )}
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
    width: 280,
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
    paddingHorizontal: 20,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  menuText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subMenu: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  subMenuItem: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  subMenuText: {
    fontSize: 18,
    color: '#555',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuButton: {
    fontSize: 32,
    color: '#333',
    marginRight: 15,
  },
  title: {
    fontSize: 22,
    color: '#333',
    fontWeight: 'bold',
  },
  body: {
    flex: 1,
    padding: 20,
  },
  bodyText: {
    fontSize: 18,
    color: '#333',
  },
});

export default App;
