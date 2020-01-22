import io from 'socket.io-client/dist/socket.io';
import ntp from 'socket-ntp/client/ntp';
import { getFingerprint } from './fingerprint.js';
import EventBus from 'eventbusjs';

const socket = io('http://localhost:3000');

export var serverTimeOffset;

export var fp;

export async function init() {
    ntp.init(socket);
    serverTimeOffset = ntp.offset();
    fp = await getFingerprint();
    socket.on("setState", update);
    EventBus.addEventListener("input_update", update)
    return Promise.resolve();
}

function update(player, input) {
    socket.emit("update", { player, input });
}

function setState(data) {
    console.log(data);
}