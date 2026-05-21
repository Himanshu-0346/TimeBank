const { Server } = require('socket.io');

let io;

module.exports = {
  init: (server) => {
    io = new Server(server);
    io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Users can join a room using their user ID to receive direct notifications
      socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their notification room.`);
      });

      // Users can join rooms based on their skills
      socket.on('joinSkillRooms', (skills) => {
        if (Array.isArray(skills)) {
          skills.forEach(skill => {
            const skillRoom = `skill_${skill.trim().toLowerCase()}`;
            socket.join(skillRoom);
            console.log(`Socket ${socket.id} joined ${skillRoom}`);
          });
        }
      });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
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
