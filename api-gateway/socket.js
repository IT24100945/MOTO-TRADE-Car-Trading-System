let io;

module.exports = {
    init: httpServer => {
        const { Server } = require('socket.io');
        io = new Server(httpServer, {
            cors: {
                origin: '*', // Define frontend URl in production
                methods: ['GET', 'POST']
            }
        });
        return io;
    },
    getIo: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }
};
