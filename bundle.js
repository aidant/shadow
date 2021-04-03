const createPrivateKey = ()=>{
    return '';
};
const createPublicKey = (privateKey)=>{
    return '';
};
const createKeyPair = ()=>{
    const privateKey = createPrivateKey();
    const publicKey = createPublicKey(privateKey);
    return {
        privateKey,
        publicKey
    };
};
console.log(String.raw`\n  _____________        _________                    _________                    _____________\n  __  ___/__  /_______ ______  /________      __    __  ____/___  _______ _____________  /__(_)_____ _______\n  _____ \__  __ \  __ '/  __  /_  __ \_ | /| / /    _  / __ _  / / /  __ '/_  ___/  __  /__  /_  __ '/_  __ \ \n  ____/ /_  / / / /_/ // /_/ / / /_/ /_ |/ |/ /     / /_/ / / /_/ // /_/ /_  /   / /_/ / _  / / /_/ /_  / / /\n  /____/ /_/ /_/\__,_/ \__,_/  \____/____/|__/      \____/  \__,_/ \__,_/ /_/    \__,_/  /_/  \__,_/ /_/ /_/\n`.replace(/\s+$/gm, '').replace(/\\n/gm, '\n'));
addEventListener('load', ()=>{
    document.body.textContent = JSON.stringify(createKeyPair(), null, 2);
});
