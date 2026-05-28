import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';

interface PDVScreenProps {
  onLogout: () => void;
  userName: string;
}

export const PDVScreen: React.FC<PDVScreenProps> = ({ onLogout, userName }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { products, searchProducts } = useProducts();
  const { items, totals, addItem, removeItem, updateItemQuantity, clearCart } = useCart();

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.trim().length > 2) {
      await searchProducts(text);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      Alert.alert('Aviso', 'Carrinho vazio');
      return;
    }

    Alert.alert('Venda', `Total: R$ ${totals.total.toFixed(2)}`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        onPress: async () => {
          // TODO: Call createSale from useSales hook
          clearCart();
          Alert.alert('Sucesso', 'Venda realizada com sucesso');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ClaudePP PDV</Text>
        <Text style={styles.headerSubtitle}>Bem-vindo, {userName}!</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produto..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Products List */}
      <View style={styles.productsContainer}>
        <Text style={styles.sectionTitle}>Produtos</Text>
        <FlatList
          data={products}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productItem}
              onPress={() => addItem(item, 1)}
            >
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>R$ {item.price.toFixed(2)}</Text>
              </View>
              <Text style={styles.addButton}>+</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>

      {/* Cart Summary */}
      <View style={styles.cartSummary}>
        <Text style={styles.sectionTitle}>Carrinho ({items.length} itens)</Text>

        {items.length === 0 ? (
          <Text style={styles.emptyCart}>Nenhum item no carrinho</Text>
        ) : (
          <>
            {items.map((item) => (
              <View key={item.productId} style={styles.cartItem}>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>{item.productName}</Text>
                  <Text style={styles.cartItemPrice}>
                    R$ {item.subtotal.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.cartItemActions}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateItemQuantity(item.productId, item.quantity - 1)}
                  >
                    <Text>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateItemQuantity(item.productId, item.quantity + 1)}
                  >
                    <Text>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeItem(item.productId)}
                  >
                    <Text style={styles.removeButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.totalsContainer}>
              <View style={styles.totalRow}>
                <Text>Subtotal:</Text>
                <Text>R$ {totals.subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text>Imposto (10%):</Text>
                <Text>R$ {totals.tax.toFixed(2)}</Text>
              </View>
              <View style={[styles.totalRow, styles.totalRowBold]}>
                <Text>Total:</Text>
                <Text>R$ {totals.total.toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutButtonText}>Finalizar Venda</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
              <Text style={styles.clearButtonText}>Limpar Carrinho</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 15,
    paddingTop: 30,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
  logoutButton: {
    position: 'absolute',
    right: 15,
    top: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  productItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  productPrice: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  cartSummary: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    maxHeight: 300,
  },
  emptyCart: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 20,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  cartItemPrice: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 3,
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    width: 24,
    height: 24,
    backgroundColor: '#ff6b6b',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    fontSize: 14,
  },
  totalRowBold: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  checkoutButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: '#ff6b6b',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
