import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as imagePeacker from 'expo-image-picker';

function Campo({ etiqueta, id, foco, onFoco, ...props }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        {...props}
        style={[
          styles.input,
          props.multiline && styles.inputMultilinea,
          foco === id && styles.inputActivo,
        ]}
        placeholderTextColor="#666"
        onFocus={() => onFoco(id)}
        onBlur={() => onFoco(null)}
      />
    </View>
  );
}

export default function InicioScreen({ perfil, onChangePerfil }) {
  const [foco, setFoco] = useState(null);
  const inicial = perfil.nombre?.trim()?.charAt(0)?.toUpperCase() || 'MP';

  const seleccionarImagen = async () => {
    try {
      const permiso = await imagePeacker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        Alert.alert(
          'Permiso necesario',
          'Autoriza el acceso a la galería para elegir una foto.'
        );
        return;
      }
      const resultado = await imagePeacker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!resultado.canceled && resultado.assets?.length) {
        onChangePerfil('imagen', resultado.assets[0].uri);
      }
    } catch (error) {
      console.log('Error al seleccionar la imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const toamrFoto = async () => {
    try {
      const permiso = await imagePeacker.requestCameraPermissionsAsync();
      if (!permiso.granted) {
        Alert.alert(
          'Permiso necesario',
          'Autoriza el acceso a la cámara para tomar una foto.'
        );
        return;
      }
      const resultado = await imagePeacker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      if (!resultado.canceled && resultado.assets?.length) {
        onChangePerfil('imagen', resultado.assets[0].uri);
      }
    } catch (error) {
      console.log('Error al tomar la foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.marca}>Mano Poderosa</Text>
        <Text style={styles.titulo}>Tu perfil</Text>
        <Text style={styles.subtitulo}>
          El nombre, el teléfono y la dirección se incluyen al compartir el pedido por WhatsApp.
        </Text>

        <View style={styles.tarjeta}>
          <View style={styles.fotoFila}>
            <View style={styles.avatar}>
              {perfil.imagen ? (
                <Image source={{ uri: perfil.imagen }} style={styles.avatarImagen} />
              ) : (
                <Text style={styles.avatarTexto}>{inicial}</Text>
              )}
            </View>
            <View style={styles.fotoTexto}>
              <Text style={styles.fotoTitulo}>Foto de perfil</Text>
              <Text style={styles.fotoAyuda}>Opcional. Sirve para identificarte.</Text>
              <View style={styles.fotoBotones}>
                <Pressable
                  style={({ pressed }) => [styles.botonFoto, pressed && styles.presionado]}
                  onPress={seleccionarImagen}
                  accessibilityLabel="Elegir foto de la galería"
                >
                  <Text style={styles.botonFotoTexto}>Galería</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.botonFoto, pressed && styles.presionado]}
                  onPress={toamrFoto}
                  accessibilityLabel="Tomar foto con la cámara"
                >
                  <Text style={styles.botonFotoTexto}>Cámara</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <Campo
            id="nombre"
            foco={foco}
            onFoco={setFoco}
            etiqueta="Nombre"
            placeholder="María Pérez"
            value={perfil.nombre}
            onChangeText={(valor) => onChangePerfil('nombre', valor)}
            autoCapitalize="words"
          />
          <Campo
            id="correo"
            foco={foco}
            onFoco={setFoco}
            etiqueta="Correo"
            placeholder="correo@ejemplo.com"
            value={perfil.correo}
            onChangeText={(valor) => onChangePerfil('correo', valor)}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Campo
            id="telefono"
            foco={foco}
            onFoco={setFoco}
            etiqueta="Teléfono"
            placeholder="0991234567"
            value={perfil.telefono}
            onChangeText={(valor) => onChangePerfil('telefono', valor)}
            keyboardType="phone-pad"
          />
          <Campo
            id="cedula"
            foco={foco}
            onFoco={setFoco}
            etiqueta="Cédula"
            placeholder="0102030405"
            value={perfil.cedula}
            onChangeText={(valor) => onChangePerfil('cedula', valor)}
            keyboardType="number-pad"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f5f5f5',
  },
  contenido: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 108,
  },
  marca: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: '#007AFF',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#161111',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
    marginBottom: 20,
  },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  fotoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F2FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImagen: {
    width: 72,
    height: 72,
  },
  avatarTexto: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  fotoTexto: {
    flex: 1,
    marginLeft: 14,
  },
  fotoTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#161111',
  },
  fotoAyuda: {
    fontSize: 13,
    lineHeight: 18,
    color: '#666',
    marginTop: 2,
  },
  fotoBotones: {
    flexDirection: 'row',
    marginTop: 10,
  },
  botonFoto: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginRight: 8,
  },
  botonFotoTexto: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '700',
  },
  presionado: {
    opacity: 0.65,
  },
  campo: {
    marginTop: 14,
  },
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
    color: '#161111',
    marginBottom: 6,
  },
  input: {
    minHeight: 48,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#fafafa',
    fontSize: 16,
    color: '#161111',
  },
  inputMultilinea: {
    minHeight: 72,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  inputActivo: {
    borderColor: '#007AFF',
    backgroundColor: '#fff',
  },
});
