export default async function (req, user) {
    let spirit = await req.db.Spirit.recallAll("group");

    let inGroups = [];

    for (let i = 0; i < spirit.memory.length; i++) {
        if (!spirit.memory[i].data) spirit.memory.splice(i, 1);
        else {
            if (Array.isArray(spirit.memory[i].data.members)) {
                if (spirit.memory[i].data.members.includes(`${user.id}`)) {
                    let groupInfo = {
                        id: spirit.memory[i].id,
                        ...spirit.memory[i].data
                    }
        
                    for (let j = 0; j < spirit.memory[i].data.members.length; j++) {
                        let user = await req.db.User.recallOne(null, null, spirit.memory[i].data.members[j]);
                        groupInfo.members[j] = {
                            id: spirit.memory[i].data.members[j],
                            name: user.memory.data.username
                        }
                    }
        
                    if (Array.isArray(spirit.memory[i].data.joinRequests)) {
                        for (let j = 0; j < spirit.memory[i].data.joinRequests.length; j++) {
                            let user = await req.db.User.recallOne(null, null, spirit.memory[i].data.joinRequests[j].id);
                            groupInfo.joinRequests[j] = {
                                id: spirit.memory[i].data.joinRequests[j].id,
                                name: user.memory.data.username,
                                note: spirit.memory[i].data.joinRequests[j].note
                            }
                        }
                    }
                    else spirit.memory[i].data.joinRequests = [];
        
                    inGroups.push(groupInfo);
                }
            }
            else spirit.memory[i].data.members = [];
        }
    }

    spirit.commit();

    return inGroups;
}