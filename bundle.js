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
    const element = typeof component === 'string' ? document.createElement(component) : new component();
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
const Fragment = ({ children  } = {
})=>{
    const element = document.createDocumentFragment();
    setChildren(element, children);
    return element;
};
const component = (name, render)=>{
    const constructor = class extends CustomComponent {
        #root = this.attachShadow({
            mode: 'closed'
        });
        constructor(){
            super();
            this.#root.append(h("link", {
                href: "style.css",
                rel: "stylesheet"
            }));
        }
        connectedCallback() {
            this.#root.append(render(this));
        }
    };
    customElements.define(name, constructor);
    return constructor;
};
const Button = component('x-button', (instance)=>{
    return h("button", null, h("slot", null));
});
const Card = component('x-card', (instance)=>{
    return h("div", {
        class: "card"
    }, h("slot", null));
});
const Input = component('x-input', (instance)=>{
    const internals = instance.attachInternals();
    console.log(internals);
    return h("input", null);
});
const Connection = component('x-connection', (instance)=>{
    console.log(instance.autoconnect);
    return h(Card, null, h(Input, null), h(Button, null, "Connect"));
});
console.log(String.raw`\n  _____________        _________                    _________                    _____________\n  __  ___/__  /_______ ______  /________      __    __  ____/___  _______ _____________  /__(_)_____ _______\n  _____ \__  __ \  __ '/  __  /_  __ \_ | /| / /    _  / __ _  / / /  __ '/_  ___/  __  /__  /_  __ '/_  __ \ \n  ____/ /_  / / / /_/ // /_/ / / /_/ /_ |/ |/ /     / /_/ / / /_/ // /_/ /_  /   / /_/ / _  / / /_/ /_  / / /\n  /____/ /_/ /_/\__,_/ \__,_/  \____/____/|__/      \____/  \__,_/ \__,_/ /_/    \__,_/  /_/  \__,_/ /_/ /_/\n`.replace(/\s+$/gm, '').replace(/\\n/gm, '\n'));
addEventListener('load', ()=>{
    document.body.append(h(Connection, null));
});
