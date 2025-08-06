const Hapi = require('@hapi/hapi');
const { Server } = require('socket.io');

const init = async () => {
    // Buat server Hapi
    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
        routes: {
            cors: {
                origin: ['http://localhost:3001', 'http://localhost:3000'], // Allow React app
                credentials: true
            }
        }
    });

    // Route sederhana untuk testing
    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return 'Hapi.js Server dengan Socket.IO berjalan!';
        }
    });

    // Route untuk trigger notifikasi (opsional, bisa lewat socket)
    server.route({
        method: 'POST',
        path: '/edit-data',
        handler: (request, h) => {
            const { userId } = request.payload || {};
            
            // Broadcast notifikasi ke semua client kecuali pengirim
            io.emit('data-changed', {
                message: `Data telah diubah oleh user ${userId || 'lain'}`,
                timestamp: new Date().toLocaleTimeString(),
                userId: userId
            });

            return { success: true, message: 'Notifikasi berhasil dikirim' };
        }
    });

    // Start server
    await server.start();
    console.log('Server Hapi.js berjalan di:', server.info.uri);

    // Buat Socket.IO server
    const io = new Server(server.listener, {
        cors: {
            origin: ['http://localhost:3001', 'http://localhost:3000'],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Handle koneksi Socket.IO
    io.on('connection', (socket) => {
        console.log('User terhubung:', socket.id);

        // Handle ketika user join dengan ID
        socket.on('join', (userId) => {
            socket.userId = userId;
            console.log(`User ${userId} bergabung dengan socket ${socket.id}`);
        });

        // Handle ketika user melakukan edit data
        socket.on('edit-data', (data) => {
            console.log('Data diubah oleh:', data.userId);
            
            // Broadcast ke semua client kecuali pengirim
            socket.broadcast.emit('data-changed', {
                message: `Data telah diubah oleh user ${data.userId}`,
                timestamp: new Date().toLocaleTimeString(),
                userId: data.userId
            });
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log('User terputus:', socket.id);
        });
    });

    console.log('Socket.IO server siap di port 3000');
};

// Handle error
process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
