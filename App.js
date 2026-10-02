import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable  } from 'react-native';


export default function App() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  
  "validaciones de los campos de entrada"
  const validarCampos = () => {
    if (nombre.trim() === '') {
      alert('Por favor, ingrese su nombre.');
      return false;
    }
    if (email.trim() === '') {
      alert('Por favor, ingrese su email.');
      return false;
    }
    if (telefono.trim() === '') {
      alert('Por favor, ingrese su teléfono.');
      return false;
    }
    if (direccion.trim() === '') {
      alert('Por favor, ingrese su dirección.');
      return false;
    }
    return true;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a nuestra tienda online</Text>
      <Text>Nombre: {nombre}</Text>
      <TextInput
        style={styles.Imput}
        placeholder="Ingrese su nombre"
        value={nombre}
        onChangeText={setNombre}
      />
      <Text>Email: {email}</Text>
      <TextInput
        style={styles.Imput}
        placeholder="Ingrese su email"
        value={email}
        onChangeText={setEmail}
      />
      <Text>Teléfono: {telefono}</Text>
      <TextInput
        style={styles.Imput}
        placeholder="Ingrese su teléfono"
        value={telefono}
        onChangeText={setTelefono}
      />
      <Text>Dirección: {direccion}</Text>
      <TextInput
        style={styles.Imput}
        placeholder="Ingrese su dirección"
        value={direccion}
        onChangeText={setDireccion}
      />
      <Pressable onPress={validarCampos}>
        <Text>Enviar</Text>
      </Pressable>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  Imput: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
    padding: 10,
  },
});
