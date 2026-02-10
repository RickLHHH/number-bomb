const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 创建 HTTP 服务器来提供静态文件
const server = http.createServer((req, res) => {
    // 安全处理路径，防止目录遍历
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // 移除查询参数
    filePath = filePath.split('?')[0];
    
    // 只允许访问根目录下的文件
    if (filePath.includes('..') || filePath.includes('//')) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    
    const fullPath = path.join(__dirname, 'public', filePath);
    const ext = path.extname(fullPath);
    
    const contentTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };
    
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('Not Found');
            } else {
                res.writeHead(500);
                res.end('Server Error');
            }
            return;
        }
        
        res.writeHead(200, { 
            'Content-Type': contentTypes[ext] || 'text/plain',
            'Cache-Control': 'no-cache'
        });
        res.end(data);
    });
});

// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ 
    server,
    // 允许任何来源连接（生产环境建议配置具体域名）
    verifyClient: () => true
});

// 房间管理
const rooms = new Map();

// 生成房间ID（6位纯数字）
function generateRoomId() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// 广播消息给房间内所有玩家
function broadcast(roomId, message, excludeWs = null) {
    const room = rooms.get(roomId);
    if (!room) return;
    
    room.players.forEach(player => {
        if (player.ws !== excludeWs && player.ws.readyState === WebSocket.OPEN) {
            try {
                player.ws.send(JSON.stringify(message));
            } catch (err) {
                console.error('Broadcast error:', err);
            }
        }
    });
}

// 发送消息给指定玩家
function sendTo(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
        try {
            ws.send(JSON.stringify(message));
        } catch (err) {
            console.error('Send error:', err);
        }
    }
}

// 清理断开连接的玩家
function cleanupPlayer(ws) {
    rooms.forEach((room, roomId) => {
        const playerIndex = room.players.findIndex(p => p.ws === ws);
        if (playerIndex !== -1) {
            const playerId = room.players[playerIndex].playerId;
            room.players.splice(playerIndex, 1);
            
            broadcast(roomId, {
                type: 'PLAYER_LEFT',
                message: `玩家 ${playerId} 离开了房间`
            }, ws);
            
            if (room.players.length === 0) {
                rooms.delete(roomId);
                console.log(`Room ${roomId} deleted`);
            }
        }
    });
}

wss.on('connection', (ws, req) => {
    console.log(`New connection from ${req.socket.remoteAddress}`);
    
    let currentRoom = null;
    let playerId = null;
    
    // 心跳检测
    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });
    
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            
            switch (message.type) {
                case 'CREATE_ROOM':
                    const roomId = generateRoomId();
                    currentRoom = roomId;
                    playerId = 1;
                    
                    rooms.set(roomId, {
                        id: roomId,
                        players: [{ ws, playerId: 1, number: null, ready: false }],
                        gameState: 'waiting',
                        currentTurn: 1,
                        history: [],
                        winner: null,
                        createdAt: Date.now()
                    });
                    
                    sendTo(ws, {
                        type: 'ROOM_CREATED',
                        roomId,
                        playerId: 1
                    });
                    
                    console.log(`Room ${roomId} created`);
                    break;
                    
                case 'JOIN_ROOM':
                    const joinRoomId = message.roomId;
                    const room = rooms.get(joinRoomId);
                    
                    if (!room) {
                        sendTo(ws, { type: 'ERROR', message: '房间不存在或已过期' });
                        return;
                    }
                    
                    if (room.players.length >= 2) {
                        sendTo(ws, { type: 'ERROR', message: '房间已满' });
                        return;
                    }
                    
                    // 检查是否已在房间中（防止重复加入）
                    if (room.players.find(p => p.ws === ws)) {
                        sendTo(ws, { type: 'ERROR', message: '你已在房间中' });
                        return;
                    }
                    
                    currentRoom = joinRoomId;
                    playerId = 2;
                    room.players.push({ ws, playerId: 2, number: null, ready: false });
                    
                    sendTo(ws, {
                        type: 'ROOM_JOINED',
                        roomId: joinRoomId,
                        playerId: 2
                    });
                    
                    broadcast(joinRoomId, {
                        type: 'PLAYER_JOINED',
                        message: '玩家 2 已加入房间'
                    }, ws);
                    
                    broadcast(joinRoomId, {
                        type: 'GAME_READY',
                        message: '两位玩家已就位，请设置数字'
                    });
                    
                    console.log(`Player 2 joined room ${joinRoomId}`);
                    break;
                    
                case 'SET_NUMBER':
                    const setRoom = rooms.get(currentRoom);
                    if (!setRoom) {
                        sendTo(ws, { type: 'ERROR', message: '房间不存在' });
                        return;
                    }
                    
                    // 验证数字格式
                    if (!/^\d{4}$/.test(message.number)) {
                        sendTo(ws, { type: 'ERROR', message: '请输入4位数字' });
                        return;
                    }
                    
                    const player = setRoom.players.find(p => p.playerId === playerId);
                    if (player) {
                        player.number = message.number;
                        player.ready = true;
                        
                        sendTo(ws, {
                            type: 'NUMBER_SET',
                            message: '数字已设置'
                        });
                        
                        console.log(`Player ${playerId} set number in room ${currentRoom}`);
                        
                        // 检查是否都准备好了
                        if (setRoom.players.every(p => p.ready)) {
                            setRoom.gameState = 'playing';
                            broadcast(currentRoom, {
                                type: 'GAME_START',
                                currentTurn: 1,
                                message: '游戏开始！玩家 1 先猜'
                            });
                            console.log(`Game started in room ${currentRoom}`);
                        } else {
                            broadcast(currentRoom, {
                                type: 'WAITING_OPPONENT',
                                message: '等待对方设置数字...'
                            }, ws);
                        }
                    }
                    break;
                    
                case 'MAKE_GUESS':
                    const guessRoom = rooms.get(currentRoom);
                    if (!guessRoom || guessRoom.gameState !== 'playing') {
                        sendTo(ws, { type: 'ERROR', message: '游戏未开始' });
                        return;
                    }
                    
                    if (guessRoom.currentTurn !== playerId) {
                        sendTo(ws, { type: 'ERROR', message: '还没到你的回合' });
                        return;
                    }
                    
                    // 验证猜测格式
                    if (!/^\d{4}$/.test(message.guess)) {
                        sendTo(ws, { type: 'ERROR', message: '请输入4位数字' });
                        return;
                    }
                    
                    const opponent = guessRoom.players.find(p => p.playerId !== playerId);
                    if (!opponent) {
                        sendTo(ws, { type: 'ERROR', message: '对手不存在' });
                        return;
                    }
                    
                    const result = calculateResult(opponent.number, message.guess);
                    
                    const guessRecord = {
                        playerId,
                        guess: message.guess,
                        result,
                        timestamp: Date.now()
                    };
                    guessRoom.history.push(guessRecord);
                    
                    // 检查是否获胜
                    if (result === 4) {
                        guessRoom.gameState = 'ended';
                        guessRoom.winner = playerId;
                        
                        broadcast(currentRoom, {
                            type: 'GAME_OVER',
                            winner: playerId,
                            winningNumber: message.guess,
                            history: guessRoom.history
                        });
                        
                        console.log(`Game over in room ${currentRoom}, winner: Player ${playerId}`);
                    } else {
                        // 切换回合
                        guessRoom.currentTurn = guessRoom.currentTurn === 1 ? 2 : 1;
                        
                        broadcast(currentRoom, {
                            type: 'GUESS_RESULT',
                            playerId,
                            guess: message.guess,
                            result,
                            currentTurn: guessRoom.currentTurn,
                            history: guessRoom.history
                        });
                    }
                    break;
                    
                case 'PLAY_AGAIN':
                    const replayRoom = rooms.get(currentRoom);
                    if (!replayRoom) {
                        sendTo(ws, { type: 'ERROR', message: '房间不存在' });
                        return;
                    }
                    
                    // 重置游戏状态
                    replayRoom.gameState = 'waiting';
                    replayRoom.currentTurn = 1;
                    replayRoom.history = [];
                    replayRoom.winner = null;
                    replayRoom.players.forEach(p => {
                        p.number = null;
                        p.ready = false;
                    });
                    
                    broadcast(currentRoom, {
                        type: 'RESET_GAME',
                        message: '重新开始游戏，请设置新数字'
                    });
                    
                    console.log(`Game reset in room ${currentRoom}`);
                    break;
                    
                case 'PING':
                    sendTo(ws, { type: 'PONG' });
                    break;
            }
        } catch (err) {
            console.error('Message error:', err);
            sendTo(ws, { type: 'ERROR', message: '消息格式错误' });
        }
    });
    
    ws.on('close', () => {
        console.log(`Connection closed for player ${playerId} in room ${currentRoom}`);
        cleanupPlayer(ws);
    });
    
    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
        cleanupPlayer(ws);
    });
});

// 心跳检测间隔
const HEARTBEAT_INTERVAL = 30000;
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping(() => {});
    });
}, HEARTBEAT_INTERVAL);

wss.on('close', () => {
    clearInterval(interval);
});

// 计算猜测结果
function calculateResult(secret, guess) {
    let correct = 0;
    for (let i = 0; i < 4; i++) {
        if (secret[i] === guess[i]) {
            correct++;
        }
    }
    return correct;
}

// 定期清理过期房间（1小时无活动）
const ROOM_CLEANUP_INTERVAL = 60 * 60 * 1000;
setInterval(() => {
    const now = Date.now();
    rooms.forEach((room, roomId) => {
        if (now - room.createdAt > ROOM_CLEANUP_INTERVAL && room.players.length === 0) {
            rooms.delete(roomId);
            console.log(`Cleaned up expired room ${roomId}`);
        }
    });
}, ROOM_CLEANUP_INTERVAL);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('═══════════════════════════════════════');
    console.log('  💣 数字炸弹服务器已启动');
    console.log(`  🌐 访问地址: http://localhost:${PORT}`);
    if (process.env.NODE_ENV === 'production') {
        console.log('  📦 生产环境模式');
    } else {
        console.log('  🔧 开发环境模式');
    }
    console.log('═══════════════════════════════════════');
});
