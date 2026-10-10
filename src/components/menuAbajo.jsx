import { Pressable } from "react-native";
import { StyleSheet, Text, View } from "react-native";
export default function MenuInferior({ pantallaActual, setPantallaActual, cantidadCarrito = 0 }){
    return(
        <View style={styles.barraMenu}>
            <Pressable style={styles.opcion} onPress={() => setPantallaActual('inicio')}>
                <Text
                    style = { pantallaActual === 'inicio'
                        ? styles.activo
                        : styles.texto
                    }
                >
                    Inicio
                </Text>
            </Pressable>
            <Pressable style={styles.opcion} onPress={() => setPantallaActual('catalogo')}>
                <Text
                    style = { pantallaActual === 'catalogo'
                        ? styles.activo
                        : styles.texto
                    }
                >
                    Catalogo
                </Text>
            </Pressable>
            <Pressable style={styles.opcion} onPress={() => setPantallaActual('carrito')}>
                <Text
                    style = { pantallaActual === 'carrito'
                        ? styles.activo
                        : styles.texto
                    }
                >
                    {cantidadCarrito > 0 ? `Carrito (${cantidadCarrito})` : 'Carrito'}
                </Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    barraMenu: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingVertical: 10,
        width: '100%',
        zIndex: 10,
    },
    opcion: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    activo: {
        color: '#007bff',
        fontWeight: 'bold',
        fontSize: 14
    },
    texto: {
        color: '#666',
        fontWeight: 'bold',
        fontSize: 14,
    }
})