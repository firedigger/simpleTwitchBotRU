
function Pvp_state(username1, username2, check_callback, result_callback, coins_pay_callback)
{
    console.log('Registered match ' + username1 + ' VS. ' + username2);
    this.username1 = username1;
    this.username1_got_result = false;
    this.username1_turn = undefined;
    this.username2 = username2;
    this.username2_got_result = false;
    this.username2_turn = undefined;
    this.pvp_callback = result_callback;
    this.check_callback = check_callback;
    this.coins_pay_callback = coins_pay_callback;
    this.finished = false;
}

Pvp_state.prototype.add_result = function (username, obj) {

    if (this.check_callback(obj))
    {
        if (username.toLowerCase() == this.username1.toLowerCase() && this.coins_pay_callback(username))
        {
            console.log('Received result from ' + username);
            this.username1_turn = obj;
            this.username1_got_result = true;
        }
        if (username.toLowerCase() == this.username2.toLowerCase() && this.coins_pay_callback(username))
        {
            console.log('Received result from ' + username);
            this.username2_turn = obj;
            this.username2_got_result = true;
        }
    }
    this.pvp_ready();

};

Pvp_state.prototype.ready = function ()
{
    return this.username1_got_result && this.username2_got_result;
};

Pvp_state.prototype.pvp_ready = function ()
{
    console.log('Check game!');
    if (this.ready())
    {
        this.finished = true;
        this.pvp_callback(this.username1, this.username1_turn, this.username2, this.username2_turn);
    }
};

module.exports = Pvp_state;