var irc = require("tmi.js");

function Twitch_irc_client(twitch_config)
{
    var twitch_irc_options = {
        options: {
            debug: true
        },
        connection: {
            cluster: "aws",
            reconnect: true
        },
        identity: {
            username: twitch_config.nickname,
            password: twitch_config.oauth
        },
        channels: twitch_config.channels
    };

    this.client = new irc.client(twitch_irc_options);
    this.channel = twitch_config.channels[0];
}

Twitch_irc_client.prototype.connect = function(func)
{
    this.client.connect().then(func);
};

/*Twitch_irc_client.prototype.send_private_message = function(to, message)
{

};*/

Twitch_irc_client.prototype.send_public_message = function(to, message)
{
    var a = '';
    if (to)
        a += to + ' -> ';
    a += message;
    this.say(a);
};

Twitch_irc_client.prototype.say = function(message)
{
    if (message)
        this.client.say(this.channel,message + "");
};

Twitch_irc_client.prototype.whisper = function(to, message)
{
    if (message)
        this.client.whisper(to,message + "");
};

Twitch_irc_client.prototype.action = function(message)
{
    if (message)
        this.client.action(this.channel,message);
};

Twitch_irc_client.prototype.on_message = function(callback)
{
    var self_obj = this;
    this.client.on("chat", function (channel, user, message, self) {
        if (channel == self_obj.channel)
        {
            callback(user.username, message, function (msg) {
                self_obj.say(msg);
            },function (to,msg) {
                self_obj.whisper(to,msg);
            });
        }
    });
};

Twitch_irc_client.prototype.on_whisper = function(callback)
{
    var self_obj = this;
    this.client.on("whisper", function (user, message) {
            callback(user.username, message, function (msg) {
                self_obj.say(msg);
            });
    });
};

Twitch_irc_client.prototype.get_mods = function(callback)
{
    this.client.mods(this.channel).then(function (result) {
        callback(result);
    });
};


Twitch_irc_client.prototype.on_join = function (callback)
{
    var self_obj = this;
    this.client.on("join", function (channel, username) {
        if (channel == self_obj.channel)
        {
            callback(username);
        }
    });
};

Twitch_irc_client.prototype.on_disjoin = function (callback)
{
    var self_obj = this;
    this.client.on("part", function (channel, username) {
        if (channel == self_obj.channel)
        {
            callback(username);
        }
    });
};

module.exports = Twitch_irc_client;