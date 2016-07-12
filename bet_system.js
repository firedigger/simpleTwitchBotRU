var fs = require('fs');

function Betting_system()
{
    this.bets = {};
    this.coefs = {};
    this.active = {};
    this.hints = {};
}

Betting_system.prototype.new_bet = function (name, coef, hint) {
    console.log('new bet');
    this.bets[name] = {};
    this.coefs[name] = coef;
    this.active[name] = true;
    this.hints[name] = hint;
};

Betting_system.prototype.do_bet = function (name, username, value, bet_money) {
    if (this.active[name] == true)
    {
        console.log(this.active[name]);
        console.log('bet accepted');
        this.bets[name][username] = {value: value, bet: bet_money};
        return true;
    }
    return false;
};

Betting_system.prototype.close_bet = function (name, callback) {
    console.log('Closing ' + name);

    this.active[name] = false;

    var options = {};

    for (var property in this.bets[name]) {
        if (this.bets[name].hasOwnProperty(property)) {
            if (!options[this.bets[name][property].value])
                options[this.bets[name][property].value] = {bets:0,money:0};
            options[this.bets[name][property].value].bets++;
            options[this.bets[name][property].value].money += (+this.bets[name][property].bet);
        }
    }
    
    //console.log(options);

    var str = 'Ставки на \"'+ this.hints[name] + '\" закрыты! Статистика: ';

    for (var property in options) {
        if (options.hasOwnProperty(property)) {
                str += '\''+ property + '\': ' + options[property].bets + ' ставок('+ options[property].money + '). ';
            }
        }
    callback(str);

};

Betting_system.prototype.reset_bets = function (name, callback) {
    for (var property in this.bets[name]) {
        if (this.bets[name].hasOwnProperty(property)) {
            callback(property, this.bets[name][property].bet);
        }
    }
};


Betting_system.prototype.show_active_bets = function (callback) {
    for (var property in this.bets) {
        if (this.bets.hasOwnProperty(property) && this.active[property]) {
                callback(this.gen_text(property,this.coefs[property],this.hints[property]));
        }
    }
};

Betting_system.prototype.gen_text = function (name, coef, hint)
{
    return 'ставка \"' + hint + '\", коэффициент ставки ' + coef + ', для того, чтобы принять участие, пропишите \"!bet '+ name + ' ваш_вариант ваша_ставка\"';
};



Betting_system.prototype.upload_result = function (name, result, callback) {
    this.active[name] = false;
    console.log('result = ' + result);
    for (var property in this.bets[name]) {
        if (this.bets[name].hasOwnProperty(property)) {
            if (this.bets[name][property]['value'] == result)
                callback(property, this.bets[name][property]['bet'] * this.coefs[name]);
        }
    }
};

Betting_system.prototype.save_to_file = function (filename)
{
    fs.writeFileSync(filename,JSON.stringify(this));
};

Betting_system.prototype.load_from_file = function (filename)
{
    var storage_str = fs.readFileSync(filename);
    var obj = JSON.parse(storage_str);
    this.bets = obj.bets;
    this.coefs = obj.coefs;
    this.active = obj.active;
    this.hints = obj.hints;
};




module.exports = Betting_system;