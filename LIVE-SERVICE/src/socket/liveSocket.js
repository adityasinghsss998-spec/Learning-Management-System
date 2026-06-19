const { Server } = require('socket.io');
const { pub, sub } = require('../config/redis');

const init = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    sub.subscribe('live:message', (err) => {
        if (err) console.log('Failed to subscribe to live:message', err);
    });

    sub.on('message', (channel, msg) => {
        try {
            const { room, data } = JSON.parse(msg);
            io.to(room).emit('message', data);
        } catch (e) {
            console.log('Failed to parse Redis message', e);
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        let currentRoom = null;
        let currentUser = null;

        socket.on('join:room', async ({ room, userId }) => {
            try {
                if (currentRoom) {
                    socket.leave(currentRoom);
                    await pub.srem(`presence:${currentRoom}`, currentUser);
                    const prev = await pub.smembers(`presence:${currentRoom}`);
                    io.to(currentRoom).emit('presence', prev);
                }

                socket.join(room);
                currentRoom = room;
                currentUser = userId;

                await pub.sadd(`presence:${room}`, userId);
                const members = await pub.smembers(`presence:${room}`);
                io.to(room).emit('presence', members);

                console.log(`User ${userId} joined room ${room}`);
            } catch (e) {
                console.log('Error on join:room', e);
            }
        });

        socket.on('send:message', async ({ room, message, userId }) => {
            try {
                await pub.publish(
                    'live:message',
                    JSON.stringify({
                        room,
                        data: {
                            message,
                            userId,
                            timestamp: new Date().toISOString(),
                        },
                    })
                );
            } catch (e) {
                console.log('Error on send:message', e);
            }
        });

        socket.on('disconnect', async () => {
            try {
                if (currentRoom && currentUser) {
                    await pub.srem(`presence:${currentRoom}`, currentUser);
                    const members = await pub.smembers(`presence:${currentRoom}`);
                    io.to(currentRoom).emit('presence', members);
                    console.log(`User ${currentUser} left room ${currentRoom}`);
                }
            } catch (e) {
                console.log('Error on disconnect', e);
            }
        });
    });
};

module.exports = { init };