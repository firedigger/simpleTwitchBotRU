
function Pvp_pool()
{
    this.pvp_pool = {};
}

function getRandomInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

Pvp_pool.prototype.add_match = function(pvp_state, timeout, timeout_callback)
{
    var id = getRandomInt(0,100);
    this.pvp_pool[id] = pvp_state;

    var self = this;

    setTimeout(function(){
        if (self.pvp_pool[id].username1_got_result)
            timeout_callback(self.pvp_pool[id].username1);
        if (self.pvp_pool[id].username2_got_result)
            timeout_callback(self.pvp_pool[id].username2);
        delete self.pvp_pool[id];
    },timeout * 1000);

    return id;
};

Pvp_pool.prototype.receive_turn = function(id, username, turn)
{
    if (this.pvp_pool[(+id)] && !this.pvp_pool[(+id)].finished)
    {
        this.pvp_pool[(+id)].add_result(username,turn);
    }
};

module.exports = Pvp_pool;