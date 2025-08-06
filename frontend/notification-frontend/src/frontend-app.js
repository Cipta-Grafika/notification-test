import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const App = () => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [desktopNotificationEnabled, setDesktopNotificationEnabled] = useState(false);

  useEffect(() => {
    // Generate random user ID untuk simulasi
    const randomUserId = `User_${Math.floor(Math.random() * 1000)}`;
    setUserId(randomUserId);

    // Cek status notification permission tanpa request
    if ('Notification' in window) {
      const permission = Notification.permission;
      setDesktopNotificationEnabled(permission === 'granted');
      console.log('Initial notification permission:', permission);
    }

    // Koneksi ke Socket.IO server
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    // Event ketika berhasil terkoneksi
    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join', randomUserId);
      console.log('Terhubung ke server dengan ID:', randomUserId);
    });

    // Event ketika terputus
    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Terputus dari server');
    });

    // Event ketika menerima notifikasi perubahan data
    newSocket.on('data-changed', (data) => {
      console.log('Notifikasi diterima:', data);
      
      // Tampilkan desktop notification
      showDesktopNotification(data.message, data.userId);
      
      setNotifications(prev => [{
        id: Date.now(),
        message: data.message,
        timestamp: data.timestamp,
        from: data.userId
      }, ...prev]);
    });

    // Cleanup ketika component unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // Fungsi untuk meminta permission desktop notification
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('Browser tidak mendukung desktop notification');
      return false;
    }

    try {
      // Cek status permission saat ini
      let permission = Notification.permission;
      
      if (permission === 'default') {
        // Request permission jika belum pernah diminta
        permission = await Notification.requestPermission();
      }
      
      const granted = permission === 'granted';
      setDesktopNotificationEnabled(granted);
      
      console.log('Desktop notification permission:', permission);
      
      if (permission === 'denied') {
        alert('Notifikasi desktop diblokir. Silakan aktifkan melalui pengaturan browser:\n\n1. Chrome: Klik ikon gembok di address bar > Notifikasi > Izinkan\n2. Firefox: Klik ikon shield > Notifikasi > Izinkan');
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Fungsi untuk menampilkan desktop notification
  const showDesktopNotification = (message, fromUserId) => {
    if (!('Notification' in window)) {
      console.log('Browser tidak mendukung desktop notification');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.log('Permission notifikasi belum diberikan');
      return;
    }

    try {
      const notification = new Notification('🔔 Notifikasi Data Update', {
        body: message,
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjVDMTcuMyA2LjcgMjAgMTAgMjAgMTRWMjBIMjJWMjJIMkg0VjIwSDZWMTRDNiAxMCA4LjcgNi43IDEyIDVWNEMxMiAyLjkgMTIuOSAyIDEyIDJaTTEyIDZDOS44IDYgOCA4LjIgOCAxMFYyMEgxNlYxMEMxNiA4LjIgMTQuMiA2IDEyIDZaTTEwIDIzSDRWMjFIMTBWMjNaIiBmaWxsPSIjNDI4NUY0Ii8+Cjwvc3ZnPgo=', // Custom notification icon
        tag: 'data-update',
        requireInteraction: false,
        silent: false,
        timestamp: Date.now()
      });

      // Auto close setelah 5 detik
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle click pada notifikasi
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Handle error
      notification.onerror = (error) => {
        console.error('Notification error:', error);
      };

    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  // Fungsi untuk toggle desktop notification
  const toggleDesktopNotification = async () => {
    if (!('Notification' in window)) {
      alert('Browser Anda tidak mendukung desktop notification');
      return;
    }

    const currentPermission = Notification.permission;
    console.log('Current permission:', currentPermission);

    if (currentPermission === 'denied') {
      alert('Notifikasi desktop diblokir. Untuk mengaktifkannya:\n\n🔧 Chrome/Edge:\n1. Klik ikon gembok/info di address bar\n2. Pilih "Notifikasi" > "Izinkan"\n3. Refresh halaman\n\n🔧 Firefox:\n1. Klik ikon shield di address bar\n2. Pilih "Notifikasi" > "Izinkan"\n3. Refresh halaman');
      return;
    }

    if (!desktopNotificationEnabled || currentPermission === 'default') {
      const granted = await requestNotificationPermission();
      if (granted) {
        // Test notification setelah berhasil mengaktifkan
        showDesktopNotification('✅ Desktop notification berhasil diaktifkan!', 'System');
      }
    } else {
      // User ingin menonaktifkan (hanya secara lokal)
      setDesktopNotificationEnabled(false);
      alert('Desktop notification dinonaktifkan untuk sesi ini.\n\nUntuk mengaktifkan kembali, klik tombol "Aktifkan".');
    }
  };

  // Fungsi untuk simulasi edit data
  const handleEditData = () => {
    if (socket && isConnected) {
      socket.emit('edit-data', { userId });
      
      // Tambah notifikasi lokal bahwa user ini yang melakukan edit
      setNotifications(prev => [{
        id: Date.now(),
        message: `Anda telah mengubah data`,
        timestamp: new Date().toLocaleTimeString(),
        from: userId,
        isOwn: true
      }, ...prev]);
    } else {
      alert('Tidak terhubung ke server!');
    }
  };

  // Fungsi untuk clear notifikasi
  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1>Aplikasi Notifikasi Real-time</h1>
      
      {/* Status koneksi */}
      <div style={{ 
        padding: '10px', 
        marginBottom: '20px',
        borderRadius: '5px',
        backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
        border: isConnected ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
      }}>
        <div style={{ marginBottom: '5px' }}>
          <strong>Status:</strong> {isConnected ? 'Terhubung' : 'Terputus'} | 
          <strong> User ID:</strong> {userId}
        </div>
        <div style={{ fontSize: '14px' }}>
          <strong>Desktop Notification:</strong> 
          <span style={{ 
            color: desktopNotificationEnabled ? '#28a745' : '#dc3545',
            marginLeft: '5px',
            marginRight: '10px'
          }}>
            {desktopNotificationEnabled 
              ? '✓ Aktif' 
              : (Notification?.permission === 'denied' 
                  ? '❌ Diblokir' 
                  : '❓ Tidak Aktif')
            }
          </span>
          <button
            onClick={toggleDesktopNotification}
            style={{
              padding: '2px 8px',
              fontSize: '12px',
              backgroundColor: desktopNotificationEnabled ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            {desktopNotificationEnabled ? 'Nonaktifkan' : 'Aktifkan'}
          </button>
          {Notification?.permission === 'denied' && (
            <span style={{ fontSize: '11px', color: '#dc3545', marginLeft: '5px' }}>
              (Diblokir di browser)
            </span>
          )}
        </div>
      </div>

      {/* Tombol untuk simulasi edit data */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleEditData}
          disabled={!isConnected}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: isConnected ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isConnected ? 'pointer' : 'not-allowed',
            marginRight: '10px'
          }}
        >
          Edit Data
        </button>
        
        <button
          onClick={() => showDesktopNotification('Test desktop notification', 'System')}
          disabled={!desktopNotificationEnabled}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: desktopNotificationEnabled ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: desktopNotificationEnabled ? 'pointer' : 'not-allowed',
            marginRight: '10px'
          }}
        >
          Test Desktop Notification
        </button>
        
        <button
          onClick={clearNotifications}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Clear Notifikasi
        </button>
      </div>

      {/* Daftar notifikasi */}
      <div>
        <h2>Daftar Notifikasi ({notifications.length})</h2>
        
        {notifications.length === 0 ? (
          <p style={{ 
            color: '#666', 
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '20px',
            border: '1px dashed #ccc',
            borderRadius: '5px'
          }}>
            Belum ada notifikasi. Buka tab browser lain dan klik "Edit Data" untuk melihat notifikasi real-time.
          </p>
        ) : (
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            border: '1px solid #ddd',
            borderRadius: '5px'
          }}>
            {notifications.map(notification => (
              <div
                key={notification.id}
                style={{
                  padding: '15px',
                  borderBottom: '1px solid #eee',
                  backgroundColor: notification.isOwn ? '#f8f9fa' : '#fff3cd',
                  borderLeft: notification.isOwn ? '4px solid #28a745' : '4px solid #ffc107'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {notification.message}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Waktu: {notification.timestamp} | Dari: {notification.from}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Petunjuk penggunaan */}
      <div style={{ 
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '5px'
      }}>
        <h3>Petunjuk Penggunaan:</h3>
        <ol>
          <li>Pastikan backend sudah berjalan di port 3000</li>
          <li>Klik "Aktifkan" untuk mengizinkan desktop notification</li>
          <li>Klik "Test Desktop Notification" untuk menguji notifikasi desktop</li>
          <li>Buka aplikasi ini di 2 tab browser berbeda</li>
          <li>Klik "Edit Data" di salah satu tab</li>
          <li>Lihat notifikasi muncul di tab lainnya + desktop notification</li>
        </ol>
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          backgroundColor: '#fff3cd', 
          borderRadius: '3px',
          fontSize: '14px'
        }}>
          <strong>💡 Tips:</strong> Desktop notification akan muncul meskipun tab browser tidak aktif atau diminimize. 
          Notification akan otomatis hilang setelah 5 detik atau bisa diklik untuk fokus ke aplikasi.
        </div>
      </div>
    </div>
  );
};

export default App;
