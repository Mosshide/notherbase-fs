module.exports = async function getTimer(db, route, user, params) {
    try {
        let poi = await db.poi.findOne({ route: route, user: user });

        let now = Date.now();

        if (!poi.data) poi.data = {
            timer: 0,
            lastTime: now
        }
        else {
            if (!poi.data.lastTime) poi.data.lastTime = now;
            if (!poi.data.timer) poi.data.timer = 0;
        }

        let difference = (now - poi.data.lastTime) / 1000;

        poi.data.timer -= difference;
        if (poi.data.timer < 0) poi.data.timer = 0;
        poi.data.lastTime = now;

        poi.markModified("data");
        await poi.save();

        return poi.data.timer;
    } 
    catch(err) {
        console.log(err);
        return false;
    }
}