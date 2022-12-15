class Establishment {
    constructor() {
        this._lastUpdate = 0;
        this.data = {};
    }
    
    load = async (service, route = currentRoute) => {
        if (!this.data[service]) this.data[service] = { _lastUpdate: 0 };

        let response = await commune("recall", {}, {
            service: service,
            _lastUpdate: this.data[service]._lastUpdate,
            route: route,
            scope: "global",
            parent: null
        });

        if (!response.isUpToDate) {
            this.data[service] = response.data;
            this._lastUpdate = this.data[service]._lastUpdate;
        }

        return this.data[service];
    }
    
    save = async (service, dataToSave, route = currentRoute) => {
        this._lastUpdate = Date.now();
        dataToSave._lastUpdate = this._lastUpdate;

        let response = await commune("commit", dataToSave, {
            service: service,
            _lastUpdate: this._lastUpdate,
            route: route,
            scope: "global",
            parent: null
        });

        this.data[service] = dataToSave;

        return response;
    }
}

const establishment = new Establishment();