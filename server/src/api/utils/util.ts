export class TwoWayMap<T1, T2> {
    map: Map<T1, T2>;
    revMap: Map<T2, T1>;
    constructor() {
        this.map = new Map<T1, T2>();
        this.revMap = new Map<T2, T1>();
    }
    get(key: T1) {
        return this.map.get(key);
    }

    revGet(key: T2) {
        return this.revMap.get(key);
    }

    set(key: T1, value: T2) {
        this.map.set(key, value);
        this.revMap.set(value, key);
    }

    delete(key: T1) {
        let value = this.map.get(key);
        this.map.delete(key);
        value && this.revMap.delete(value);
    }

    revDelete(key: T2) {
        let value = this.revMap.get(key);
        this.revMap.delete(key);
        value && this.map.delete(value);
    }
}