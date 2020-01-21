import io from 'socket.io-client/dist/socket.io';
import ntp from 'socket-ntp/client/ntp';
import { getFingerprint } from './fingerprint.js';
import EventBus from 'eventbusjs';

const socket = io('http://localhost:3000');

export var serverTimeOffset;

export var fingerprint;

export async function init() {
    ntp.init(socket);
    serverTimeOffset = ntp.offset();
    fingerprint = await getFingerprint();
    socket.on("setState", update);
    return Promise.resolve();
}

function update(data) {
    socket.emit("update", data);
}

function setState(data) {
    console.log(data);
}