import io from 'socket.io-client/dist/socket.io';
import ntp from 'socket-ntp/client/ntp';
import { getFingerprint } from './fingerprint.js';
import EventBus from 'eventbusjs';
import { Megaman } from './megaman.js';

var socket;

if (process.env.NODE_ENV == 'production') {
    socket = io("https://megaman-online.herokuapp.com/");
} else {
    socket = io("localhost:3000");
}

export let serverTimeOffset;

export let fp;

let players = {};

export async function init() {
    ntp.init(socket);
    serverTimeOffset = ntp.offset();
    fp = await getFingerprint();
    socket.on("set_player", setPlayer);
    EventBus.addEventListener("update_player", updatePlayer)
    return Promise.resolve();
}

function updatePlayer(event) {
    socket.emit("update_player", { player: event.target.player, input: event.target.input, fp });
}

function setPlayer(p) {
    if (p.fp === fp) return;
    if (!players[p.fp]) {
        players[p.fp] = new Megaman(p.player, p.input);
    } else {
        Object.keys(players).forEach(fp => {
            players[fp].setData(p.player, p.input);
        })
    }
}

export function move(dt) {
    Object.keys(players).forEach(fp => {
        players[fp].move(dt);
    })
}

export function draw(dt) {
    Object.keys(players).forEach(fp => {
        players[fp].draw(dt);
    })
}