var fs = require('fs');

function Stationary_commands()
{
    this.commands = {};
}

Stationary_commands.prototype.add = function (key, value) {
    this.commands[key] = value;
};

Stationary_commands.prototype.delete = function (key) {
    delete this.commands[key];
};

Stationary_commands.prototype.get = function (key) {
    return this.commands[key];
};

Stationary_commands.prototype.save_to_file = function (filename)
{
    fs.writeFileSync(filename,JSON.stringify(this.commands));
};

Stationary_commands.prototype.load_from_file = function (filename)
{
    var storage_str = fs.readFileSync(filename);
    this.commands = JSON.parse(storage_str);
};

Stationary_commands.prototype.forEach = function (callback)
{
    for (var property in this.commands) {
        if (this.commands.hasOwnProperty(property)) {
            callback(property, this.commands[property]);
        }
    }

};


module.exports = Stationary_commands;