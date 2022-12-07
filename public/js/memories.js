class Memories {
    constructor() {
        this._lastUpdate = 0;
        this.data = {};
    }
    
    load = async (service, route = currentRoute) => {
        try {
            await $.get(`/recall`, {
                route: route,
                service: service,
                _lastUpdate: this._lastUpdate
            }, (res) => {
                if (!res.isUpToDate && res.data) {
                    this.data[service] = JSON.parse(res.data);
                    this._lastUpdate = this.data[service]._lastUpdate;
                }
            });

            return this.data[service];
        } catch (error) {
            return error;
        }
    }
    
    save = async (service, dataToSave, route = currentRoute) => {
        try {
            this._lastUpdate = Date.now();

            await $.post('/commit', {
                route: route,
                service: service,
                _lastUpdate: this._lastUpdate,
                data: JSON.stringify(dataToSave)
            }, (data) => {
                this.data[service] = dataToSave;
                return "saved";
            });
        } catch (error) {
            return error;
        }
    }
}

const memories = new Memories();