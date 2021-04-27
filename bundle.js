class CustomComponent extends HTMLElement {
}
const setProp = (element, property, value)=>{
    if (property in element || element instanceof CustomComponent) {
        element[property] = value;
    } else if (value == null) {
        element.removeAttribute(property);
    } else {
        element.setAttribute(property, value);
    }
};
const setChildren = (element, children)=>{
    if (Array.isArray(children)) {
        for (const child of children){
            if (child) {
                element.append(child);
            }
        }
    } else if (children) {
        element.append(children);
    }
};
const jsx = (component, { 'x:ref': ref , children , ...props } = {
})=>{
    const element = typeof component === 'string' ? document.createElement(component) : component instanceof Element ? component : new component();
    setChildren(element, children);
    if (typeof ref === 'function') {
        ref(element);
    }
    for(const property in props){
        const value = props[property];
        if (property.startsWith('on:')) {
            const event = property.replace(/^on:/, '');
            element.addEventListener(event, value);
        } else {
            setProp(element, property, value);
        }
    }
    return element;
};
const h = (component, props = {
}, ...children)=>jsx(component, {
        ...props,
        children
    })
;
function Fragment({ children  } = {
}) {
    const element = document.createDocumentFragment();
    setChildren(element, children);
    return element;
}
const component = (name, render)=>{
    const constructor = class extends CustomComponent {
        shadowRoot = this.attachShadow({
            mode: 'closed'
        });
        constructor(){
            super();
            this.shadowRoot.append(h("link", {
                href: "style.css",
                rel: "stylesheet"
            }));
        }
        connectedCallback() {
            const use = {
                dispatch: (name1, data)=>{
                    const event = data instanceof Event ? data : new CustomEvent(name1, {
                        detail: data
                    });
                    this.dispatchEvent(event);
                }
            };
            this.shadowRoot.append(render(this, use));
        }
    };
    customElements.define(name, constructor);
    return constructor;
};
const keyCodes = {
    enter: 13,
    space: 32
};
const isKey = (event, key)=>{
    return event.code?.toLowerCase() === key || event.key?.toLowerCase() === key || event.which === keyCodes[key] || event.keyCode === keyCodes[key];
};
const Button = component('x-button', (Component, use)=>{
    const handleKeyDown = (event)=>{
        if (isKey(event, 'enter') || isKey(event, 'space')) {
            event.preventDefault();
            use.dispatch('submit');
        }
    };
    const handleClick = (event)=>{
        use.dispatch('submit');
    };
    h(Component, {
        tabIndex: "0",
        "on:keydown": handleKeyDown,
        "on:click": handleClick
    });
    return h("slot", {
        class: "x-button",
        part: "x-button"
    });
});
const Input = component('x-input', ({ label , default: defaultValue  }, use)=>{
    const handleKeyDown = (event)=>{
        if (isKey(event, 'enter')) {
            event.preventDefault();
            use.dispatch('submit');
        }
    };
    const handleChange = (event)=>{
        use.dispatch('change', event.target.textContent);
    };
    return h(Fragment, null, h("span", {
        class: "x-input-label"
    }, label), h("div", {
        contentEditable: "true",
        class: "x-input",
        "on:keydown": handleKeyDown,
        "on:input": handleChange
    }, defaultValue));
});
const createStore = (state)=>{
    const subscriptions = new Set();
    const get = ()=>{
        return state;
    };
    const set = (newState, force)=>{
        if (!force && state === newState) return state;
        state = newState;
        subscriptions.forEach((subscription)=>subscription(state)
        );
        return state;
    };
    const update = (updater)=>{
        return set(updater(get()));
    };
    const subscribe = (subscription)=>{
        subscriptions.add(subscription);
        subscription(state);
        return ()=>subscriptions.delete(subscription)
        ;
    };
    return {
        get,
        set,
        update,
        subscribe
    };
};
const gf = (init)=>{
    const r = new Float64Array(16);
    if (init) {
        for(let i = 0; i < init.length; i++){
            r[i] = init[i];
        }
    }
    return r;
};
const unpack25519 = (o, n)=>{
    for(let i = 0; i < 16; i++){
        o[i] = n[2 * i] + (n[2 * i + 1] << 8);
    }
    o[15] &= 32767;
};
const sel25519 = (p, q, b)=>{
    let t;
    let c = ~(b - 1);
    for(let i = 0; i < 16; i++){
        t = c & (p[i] ^ q[i]);
        p[i] ^= t;
        q[i] ^= t;
    }
};
const A = (o, a, b)=>{
    for(let i = 0; i < 16; i++){
        o[i] = a[i] + b[i] | 0;
    }
};
const Z = (o, a, b)=>{
    for(let i = 0; i < 16; i++){
        o[i] = a[i] - b[i] | 0;
    }
};
const M = (o, a, b)=>{
    let t = new Float64Array(31);
    for(let i = 0; i < 31; i++){
        t[i] = 0;
    }
    for(let i1 = 0; i1 < 16; i1++){
        for(let j = 0; j < 16; j++){
            t[i1 + j] += a[i1] * b[j];
        }
    }
    for(let i2 = 0; i2 < 15; i2++){
        t[i2] += 38 * t[i2 + 16];
    }
    for(let i3 = 0; i3 < 16; i3++){
        o[i3] = t[i3];
    }
    car25519(o);
    car25519(o);
};
const S = (o, a)=>{
    M(o, a, a);
};
const inv25519 = (o, i)=>{
    let c = gf();
    for(let a = 0; a < 16; a++){
        c[a] = i[a];
    }
    for(let a1 = 253; a1 >= 0; a1--){
        S(c, c);
        if (a1 !== 2 && a1 !== 4) {
            M(c, c, i);
        }
    }
    for(let a2 = 0; a2 < 16; a2++){
        o[a2] = c[a2];
    }
};
const car25519 = (o)=>{
    let c;
    for(let i = 0; i < 16; i++){
        o[i] += 65536;
        c = Math.floor(o[i] / 65536);
        o[(i + 1) * (i < 15 ? 1 : 0)] += c - 1 + 37 * (c - 1) * (i === 15 ? 1 : 0);
        o[i] -= c * 65536;
    }
};
const pack25519 = (o, n)=>{
    let b;
    let m = gf();
    let t = gf();
    for(let i = 0; i < 16; i++){
        t[i] = n[i];
    }
    car25519(t);
    car25519(t);
    car25519(t);
    for(let j = 0; j < 2; j++){
        m[0] = t[0] - 65517;
        for(let i1 = 1; i1 < 15; i1++){
            m[i1] = t[i1] - 65535 - (m[i1 - 1] >> 16 & 1);
            m[i1 - 1] &= 65535;
        }
        m[15] = t[15] - 32767 - (m[14] >> 16 & 1);
        b = m[15] >> 16 & 1;
        m[14] &= 65535;
        sel25519(t, m, 1 - b);
    }
    for(let i1 = 0; i1 < 16; i1++){
        o[2 * i1] = t[i1] & 255;
        o[2 * i1 + 1] = t[i1] >> 8;
    }
};
const createPresharedKey = ()=>{
    const presharedKey = new Uint8Array(32);
    crypto.getRandomValues(presharedKey);
    return presharedKey;
};
const createPrivateKey = ()=>{
    const privateKey = new Uint8Array(32);
    crypto.getRandomValues(privateKey);
    privateKey[31] = privateKey[31] & 127 | 64;
    privateKey[0] &= 248;
    return privateKey;
};
const createPublicKey = (privateKey)=>{
    const publicKey = new Uint8Array(32);
    const z = new Uint8Array(32);
    const x = new Float64Array(80);
    let r;
    const a = gf();
    const b = gf();
    const c = gf();
    const d = gf();
    const e = gf();
    const f = gf();
    const _121665 = gf([
        56129,
        1
    ]);
    const _9 = new Uint8Array(32);
    _9[0] = 9;
    for(let i = 0; i < 31; i++){
        z[i] = privateKey[i];
    }
    z[31] = privateKey[31] & 127 | 64;
    z[0] &= 248;
    unpack25519(x, _9);
    for(let i1 = 0; i1 < 16; i1++){
        b[i1] = x[i1];
        d[i1] = a[i1] = c[i1] = 0;
    }
    a[0] = d[0] = 1;
    for(let i2 = 254; i2 >= 0; --i2){
        r = z[i2 >>> 3] >>> (i2 & 7) & 1;
        sel25519(a, b, r);
        sel25519(c, d, r);
        A(e, a, c);
        Z(a, a, c);
        A(c, b, d);
        Z(b, b, d);
        S(d, e);
        S(f, a);
        M(a, c, a);
        M(c, b, e);
        A(e, a, c);
        Z(a, a, c);
        S(b, a);
        Z(c, d, f);
        M(a, c, _121665);
        A(a, a, d);
        M(c, c, a);
        M(a, d, f);
        M(d, b, x);
        S(b, e);
        sel25519(a, b, r);
        sel25519(c, d, r);
    }
    for(let i3 = 0; i3 < 16; i3++){
        x[i3 + 16] = a[i3];
        x[i3 + 32] = c[i3];
        x[i3 + 48] = b[i3];
        x[i3 + 64] = d[i3];
    }
    const x32 = x.subarray(32);
    const x16 = x.subarray(16);
    inv25519(x32, x32);
    M(x16, x16, x32);
    pack25519(publicKey, x16);
    return publicKey;
};
const createBase64EncodedKey = (key)=>{
    return btoa(String.fromCharCode(...key));
};
const createKeyPair = ()=>{
    const privateKey = createPrivateKey();
    const presharedKey = createPresharedKey();
    const publicKey = createPublicKey(privateKey);
    return {
        privateKey: createBase64EncodedKey(privateKey),
        presharedKey: createBase64EncodedKey(presharedKey),
        publicKey: createBase64EncodedKey(publicKey)
    };
};
const address = createStore('10.0.0.1');
const configuration = createStore(null);
const api = async (path, init)=>{
    return fetch(`//${address.get()}${path}`, init).then((response)=>{
        if (response.ok) {
            return response;
        } else {
            throw new Error(`Request failed with status code: "${response.status}".`);
        }
    });
};
let configurationAbortController = new AbortController();
const loadConfiguration = async ()=>{
    configurationAbortController.abort();
    configurationAbortController = new AbortController();
    const response = await api('/api/configuration', {
        signal: configurationAbortController.signal
    }).then((response1)=>response1.json()
    );
    configuration.set(response);
};
address.subscribe(loadConfiguration);
globalThis.loadConfiguration = loadConfiguration;
const createInterface = async (payload)=>{
    await api('/api/interfaces', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; encoding=utf-8'
        },
        body: JSON.stringify(payload)
    });
    await loadConfiguration();
};
const createPeer = async (interfaceName, peerName)=>{
    const { privateKey , presharedKey , publicKey  } = createKeyPair();
    const payload = {
        name: peerName,
        publicKey,
        presharedKey
    };
    const configuration1 = await api(`/api/interfaces/${interfaceName}/peers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; encoding=utf-8'
        },
        body: JSON.stringify(payload)
    }).then((response)=>response.json()
    );
    await loadConfiguration();
    return configuration1.replace('PRIVATE_KEY', privateKey);
};
const Connection = component('x-connection', ()=>{
    let value = address.get();
    const handleChange = ({ detail: newValue  })=>{
        value = newValue;
    };
    const handleSubmit = ()=>{
        address.set(value, true);
    };
    return h(Fragment, null, h(Input, {
        label: "Address",
        default: value,
        "on:change": handleChange
    }), h(Button, {
        className: "x-connection-submit",
        "on:submit": handleSubmit
    }, "Connect"));
});
const download = (filename, content, type = 'text/plain')=>{
    const blob = new Blob([
        content
    ], {
        type
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    queueMicrotask(()=>{
        URL.revokeObjectURL(url);
    });
};
const Create = component('x-create', ()=>{
    let type = 'peer';
    let name = '';
    const handleTypeChange = (event)=>{
        type = event.target?.value;
        console.log(type, name);
    };
    const handleNameChange = ({ detail: newName  })=>{
        name = newName;
        console.log(type, name);
    };
    const handleCreateCtaClick = ()=>{
        const config = configuration.get();
        if (type === 'peer') {
            createPeer(config?.interfaces[0].name, name).then((config1)=>{
                download('vpn.conf', config1);
            });
        }
        if (type === 'interface') {
            createInterface({
                name,
                port: 51820,
                ipv4: '10.0.0.0/24'
            });
        }
    };
    return h(Fragment, null, h("div", {
        class: "x-type-selection"
    }, h("label", {
        class: "x-input-label",
        for: "type-selection"
    }, "Type"), h("select", {
        name: "type",
        id: "type-selection",
        "on:change": handleTypeChange
    }, h("option", {
        value: "interface"
    }, "Interface"), h("option", {
        value: "peer",
        selected: true
    }, "Peer"))), h(Input, {
        className: "x-create-input",
        "on:change": handleNameChange
    }), h(Button, {
        className: "cta",
        "on:submit": handleCreateCtaClick
    }, h("img", {
        src: "plus.svg",
        alt: "Add"
    })));
});
const Interfaces = component('x-interfaces', (Component, use)=>{
    const host = h("h1", {
        slot: "title",
        class: "x-hostname"
    });
    const ulInterfaces = h("ul", {
        slot: "list"
    });
    Component.append(host, ulInterfaces);
    configuration.subscribe((config)=>{
        if (!config) return;
        host.textContent = config.metadata.host;
        for(let indexInterface = 0; true; indexInterface++){
            const iface = config.interfaces[indexInterface];
            let liInterface = ulInterfaces.childNodes[indexInterface];
            if (iface) {
                liInterface ??= ulInterfaces.appendChild(h("li", null));
                const h2 = liInterface.querySelector('h2') || liInterface.appendChild(h("h2", {
                    class: "x-interface"
                }));
                const ulPeers = liInterface.querySelector('ul') || liInterface.appendChild(h("ul", {
                    class: "x-peers-container"
                }));
                h2.textContent = iface.name;
                for(let indexPeer = 0; true; indexPeer++){
                    const peer = iface.peers[indexPeer];
                    let liPeer = ulPeers.childNodes[indexPeer];
                    if (peer) {
                        liPeer ??= ulPeers.appendChild(h("li", {
                            class: "x-peer"
                        }));
                        const h3 = liPeer.querySelector('h3') || liPeer.appendChild(h("h3", {
                            class: "x-peer-name"
                        }));
                        const span = liPeer.querySelector('span') || liPeer.appendChild(h("span", {
                            class: "x-peer-ip"
                        }));
                        h3.textContent = peer.name;
                        span.textContent = peer.ip;
                    } else {
                        if (liPeer) liPeer.remove();
                        else break;
                    }
                }
            } else {
                if (liInterface) liInterface.remove();
                else break;
            }
        }
    });
    return h(Fragment, null, h("slot", {
        name: "title"
    }), h("slot", {
        name: "list"
    }), h(Create, null));
});
const ConnectionManager = component('x-connection-manager', (Component)=>{
    const connectionElement = h(Connection, null);
    const interfacesElement = h(Interfaces, null);
    configuration.subscribe((config)=>{
        if (config) {
            connectionElement.remove();
            if (!Component.contains(interfacesElement)) {
                Component.append(interfacesElement);
            }
        } else {
            interfacesElement.remove();
            if (!Component.contains(connectionElement)) {
                Component.append(connectionElement);
            }
        }
    });
    return h("slot", null);
});
console.log(String.raw`\n  _____________        _________                    _________                    _____________\n  __  ___/__  /_______ ______  /________      __    __  ____/___  _______ _____________  /__(_)_____ _______\n  _____ \__  __ \  __ '/  __  /_  __ \_ | /| / /    _  / __ _  / / /  __ '/_  ___/  __  /__  /_  __ '/_  __ \ \n  ____/ /_  / / / /_/ // /_/ / / /_/ /_ |/ |/ /     / /_/ / / /_/ // /_/ /_  /   / /_/ / _  / / /_/ /_  / / /\n  /____/ /_/ /_/\__,_/ \__,_/  \____/____/|__/      \____/  \__,_/ \__,_/ /_/    \__,_/  /_/  \__,_/ /_/ /_/\n`.replace(/\s+$/gm, '').replace(/\\r?\\n/gm, '\n'));
addEventListener('load', ()=>{
    document.body.append(h(ConnectionManager, null));
});
