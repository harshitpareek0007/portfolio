const mongoose = require('mongoose');

const checkHealth = (req, res) => {
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

    res.status(200).json({
        status: 'ok',
        database: dbStatus
    });
};

module.exports = {
    checkHealth
};
