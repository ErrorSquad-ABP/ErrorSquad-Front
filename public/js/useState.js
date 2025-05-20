// state.js
export function useState(initialValue) {
    let state = initialValue;
    const listeners = [];

    return {
        get value() {
            return state;
        },
        set value(newValue) {
            state = newValue;
            listeners.forEach((listener) => listener(state));
        },
        subscribe(listener) {
            listeners.push(listener);
        },
    };
}

