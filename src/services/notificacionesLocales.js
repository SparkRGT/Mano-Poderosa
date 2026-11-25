// Adaptador para expo-notifications 58.1.x.
// La entrada general también carga topics de FCM. En 58.1.9 ese módulo es opcional,
// pero estas rutas mantienen la prueba local independiente de las funciones push.
// Revisar estas rutas internas al actualizar la versión de expo-notifications.
export { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
export {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  getLastNotificationResponse,
} from 'expo-notifications/build/NotificationsEmitter';
export { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
export { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
export { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
export { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
