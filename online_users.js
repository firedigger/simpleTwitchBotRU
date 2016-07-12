
function Online_users_storage(period, time_limit)
{
    this.users = {};
    var self = this;
    setInterval(function () {
        self.check(period, time_limit);
    },period*1000);
}

Online_users_storage.prototype.add = function (username)
{
    this.users[username] = 0;
};

Online_users_storage.prototype.delete = function (username)
{
    delete this.users[username];
};

Online_users_storage.prototype.forEach = function (callback)
{
    for (var property in this.users) {
        if (this.users.hasOwnProperty(property)) {
            callback(property, this.users[property]);
        }
    }
};

Online_users_storage.prototype.list = function () {
    var str = [];
    this.forEach(function (username) {
        str.push(username);
    });
    return str;
};


Online_users_storage.prototype.check = function (period, time_limit) {
    var self = this;
    this.forEach(function (user, time) {
        time += time_limit;
        if (time >= time_limit)
        {
            self.delete(user);
            console.log('Deleted ' + user);
        }
    });
};


module.exports = Online_users_storage;