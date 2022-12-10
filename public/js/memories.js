class Memories {
    constructor() {
        this._lastUpdate = 0;
        this.data = {};
    }
    
    load = async (service, route = currentRoute, parent = null) => {
        try {
            if (!this.data[service]) this.data[service] = { _lastUpdate: 0 };

            await $.post(`/s`, {
                action: "recall",
                service: service,
                _lastUpdate: this.data[service]._lastUpdate,
                route: route,
                scope: "local",
                parent: parent
            }, (res) => {
                console.log(res);
                if (!res.isUpToDate) {
                    this.data[service] = JSON.parse(res.data);
                    this._lastUpdate = this.data[service]._lastUpdate;
                }
                console.log(JSON.parse(res.data));
            });

            return this.data[service];
        } catch (error) {
            return error;
        }
    }
    
    save = async (service, dataToSave, route = currentRoute, parent = null) => {
        try {
            this._lastUpdate = Date.now();

            await $.post('/s', {
                action: "commit",
                service: service,
                _lastUpdate: this._lastUpdate,
                route: route,
                scope: "local",
                parent: parent,
                data: JSON.stringify(dataToSave)
            }, (res) => {
                this.data[service] = dataToSave;
                return "saved";
            });
        } catch (error) {
            return error;
        }
    }
}

const memories = new Memories();