function Cooldowner(period, cooldown)
{
    this.users = {};
    this.cooldown = cooldown;
    var self = this;
    setInterval(function () {
        self.check(period, cooldown);
    },period*1000);
}

Cooldowner.prototype.add = function (username,word)
{
    if (!this.users[username])
        this.users[username] = {};
    this.users[username][word] = 0;
};

Cooldowner.prototype.allow = function (username,word)
{
    if (this.users[username])
    {
        if (this.users[username][word])
        {
            if (this.users[username][word] > this.cooldown)
            {
                this.users[username][word] = 0;
                return true;
            }
            else
                return false;
        }
        return true;
    }
    return true;
};

Cooldowner.prototype.forEach = function (callback)
{
    for (var property in this.users) {
        if (this.users.hasOwnProperty(property)) {
            callback(property, this.users[property]);
        }
    }
};



Cooldowner.prototype.check = function (period) {
    var self = this;
    this.forEach(function (user, words) {
        for (var property in words) {
            if (words.hasOwnProperty(property)) {
                words[property] += period;
            }
        }
    });
};


module.exports = Cooldowner;