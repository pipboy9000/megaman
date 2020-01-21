import Fingerprint2 from 'fingerprintjs2';

let fp = null;

let options = {
    excludes: { canvas: true, audio: true, fonts: true, webgl: true }
}

let getFp = new Promise(function (res, err) {
    if (window.requestIdleCallback) {
        requestIdleCallback(function () {
            Fingerprint2.get(function (components) {
                var values = components.map(function (component) { return component.value })
                var murmur = Fingerprint2.x64hash128(values.join(''), 31)
                fp = murmur;
                res(murmur) // an array of components: {key: ..., value: ...}
            })
        })
    } else {
        setTimeout(function () {
            Fingerprint2.get(function (components) {
                var values = components.map(function (component) { return component.value })
                var murmur = Fingerprint2.x64hash128(values.join(''), 31)
                fp = murmur;
                res(murmur) // an array of components: {key: ..., value: ...}
            })
        }, 500)
    }
})

export async function getFingerprint() {
    if (fp) return Promise.resolve(fp);
    return getFp
}