importScripts('https://www.gstatic.com/firebasejs/9.19.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.19.1/firebase-messaging-compat.js');

// Todo: Figure out whether the environment variables are available in the service worker
// or if they need to be hardcoded.
firebase.initializeApp({
  apiKey: 'AIzaSyDvv6uJYIT1rcJ7hE6QNKtWUf34WRMdiWY',
  authDomain: 'keyorewards.firebaseapp.com',
  projectId: 'keyorewards',
  storageBucket: 'keyorewards.firebasestorage.app',
  messagingSenderId: '614295869059',
  appId: '1:614295869059:web:1568d0ab1227517cda2db6',
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);

  const notificationTitle = payload.notification.title || 'Notification';
  const notificationOptions = {
    body: payload.notification.body || '',
    icon: '/logo.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
