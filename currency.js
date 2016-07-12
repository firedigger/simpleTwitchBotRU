var fs = require('fs');

function Currency_holder(init_value)
{
    this.storage = {};
    this.init_value = (+init_value);
}


Currency_holder.prototype.check_first_time = function(username)
{
    if (this.storage[username] == undefined)
        this.storage[username] = this.init_value;
};


Currency_holder.prototype.get_currency = function(username)
{
    this.check_first_time(username.toLowerCase());
    return (+this.storage[username.toLowerCase()]);
};

Currency_holder.prototype.has = function(username, sum)
{
    return (this.get_currency(username) >= sum);
};


Currency_holder.prototype.get_top_position = function(username)
{
    var k = 1;
    for (var property in this.storage) {
        if (this.storage.hasOwnProperty(property)) {
            if ((this.get_currency(property)) > (this.get_currency(username)))
                k = k + 1;
        }
    }
    return k;
};


Currency_holder.prototype.update_currency = function(username, delta)
{
    var value = (+this.get_currency(username));
    this.storage[username.toLowerCase()] = value + (+delta);
    return this.get_currency(username);
};

Currency_holder.prototype.withdraw_with_check = function(username, delta)
{
    if (this.get_currency(username) >= delta)
    {
        this.update_currency(username,-delta);
        return true;
    }
    else
        return false;
};

Currency_holder.prototype.save_to_file = function (filename)
{
    //console.log(this.storage);
    fs.writeFileSync(filename,JSON.stringify(this.storage));
};

Currency_holder.prototype.load_from_file = function (filename)
{
    var storage_str = fs.readFileSync(filename);
    this.storage = JSON.parse(storage_str);
    //console.log(this.storage);
    this.init_value = 100;
};

module.exports = Currency_holder;