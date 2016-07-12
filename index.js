/* TODO
 * "где", "что" в magic ball
 * add cooldown to commands
 * osu! requests
 * playing with bot
 * голосование
 */

var fs = require('fs');
 
var channel = process.argv[2] ? process.argv[2] : 'firedigger';

var folder = 'data/';

var twitch_config = JSON.parse(fs.readFileSync('twitch_config.json'));
twitch_config.host = channel;
twitch_config.channels = ['#' + channel];
console.log(twitch_config);

var twitch_irc_client_lib = require('./twitch_irc');
var currency_holder_lib = require('./currency');
var online_users_lib = require('./online_users');
var pvp_state_lib = require('./pvp_state');
var pvp_pool_lib = require('./pvp_pool');
var stationary_commands_lib = require('./stationary_commands');
var magic_ball_lib = require('./magic_ball');
var bet_system_lib = require('./bet_system');
var quiz_game_lib = require('./quiz_game');
var cooldowner = require('./cooldowner');

var twitch_irc_client = new twitch_irc_client_lib(twitch_config);
var currency_holder = new currency_holder_lib(100);
var currency_filename = folder + twitch_config.host + '_coins.data';
if (fs.existsSync(currency_filename))
{
    console.log('Reading currency');
    currency_holder.load_from_file(currency_filename);
}
var online_users = new online_users_lib(15,180);
var pvp_pool = new pvp_pool_lib();
var stationary_commands = new stationary_commands_lib();
var commands_filename = folder + twitch_config.host + '_commands.txt';
if (fs.existsSync(commands_filename))
    stationary_commands.load_from_file(commands_filename);
var magic_ball = new magic_ball_lib();
var bet_system_filename = folder + twitch_config.host + '_bets.txt';
var bet_system = new bet_system_lib();
if (fs.existsSync(bet_system_filename))
    bet_system.load_from_file(bet_system_filename);
var quiz_game = new quiz_game_lib();


var coins_period_seconds = 10;
var coins_period_value = 10;
var pvp_init_cost = 15;
var pvp_timeout = 120;

if (process.platform === "win32") {
    var rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on("SIGINT", function () {
        process.emit("SIGINT");
    });
}
process.on("SIGINT", function () {
    bet_system.save_to_file(bet_system_filename);
    currency_holder.save_to_file(currency_filename);
    stationary_commands.save_to_file(commands_filename);
    process.exit();
});

var mods_list;


function check_mod(username) {
    return mods_list.indexOf(username.toLocaleLowerCase()) > -1;
}

process.on('exit', function (code) {
    console.log('Exiting');
});

twitch_irc_client.connect(function (data) {
    /*setInterval(function () {
        online_users.forEach(function(username) {
            currency_holder.update_currency(username,coins_period_value);
        });
    },coins_period_seconds * 1000);*/
    twitch_irc_client.get_mods(function (res) {
        mods_list = res;
        mods_list.push(twitch_config.host);
        mods_list.push('firedigger');
    });
});

function currency_getter(user)
{
    return currency_holder.get_currency(user);
}

function gen_pvp_hint(match_id) {
    return 'Вас вызвали на дуэль! Для того, чтобы принять вызов, отправьте личное сообщение боту с текстом \'!pvp ' + match_id + ' ход\', где ход - это одно из (камень, ножницы, бумага)';
}

function rock_scissors_paper(turn1, turn2) {
    var g = {};
    g['камень'] = 'ножницы';
    g['ножницы'] = 'бумага';
    g['бумага'] = 'камень';

    if (turn1 == turn2)
        return 0;
    if (g[turn1] == turn2)
        return 1;
    else
        return -1;
}

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};

function pvp_fight(username1, username2, game_cost) {

    return gen_pvp_hint(pvp_pool.add_match(new pvp_state_lib(username1,username2,
        function (turn) {
            return ['камень','ножницы','бумага'].contains(turn);
        },
        function (username1, username1_turn, username2, username2_turn) {
        twitch_irc_client.action(username1 + ' VS. ' + username2);

        setTimeout(function(){

            var result = rock_scissors_paper(username1_turn,username2_turn);
            if (result == 0)
            {
                twitch_irc_client.action('Ничья');

                currency_holder.update_currency(username1,game_cost);
                currency_holder.update_currency(username2,game_cost);

            }
            else
            {
                var winner = ((result == 1) ? username1 : username2);
                var loser = ((result == -1) ? username1 : username2);
                twitch_irc_client.action(username1 + ' выбрал \'' + username1_turn + '\', ' + username2 + ' выбрал \'' + username2_turn + '\'');
                twitch_irc_client.action('Победил ' + winner);
                currency_holder.update_currency(winner, 2 * game_cost);
                twitch_irc_client.whisper(loser,'Вы проиграли ', game_cost);
            }            
        }, 4 * 1000);
    },function (username) {
            if (currency_holder.withdraw_with_check(username,game_cost))
                return true;
            twitch_irc_client.whisper(username,'Недостаточно средств');
            return false;
        }),pvp_timeout, function (username) {

    }));
}

function isNumeric(num){
    return !isNaN(num)
}

function check_stationary_command(message, callback) {

    if (message.startsWith('!')) {
        stationary_commands.forEach(function (key, value) {
            if (message == ('!' + key))
                callback(value);
        });
    }
}

function replaceString(oldS, newS, fullS) {
    return fullS.split(oldS).join(newS);
}

function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function magic_ball_func(message)
{
    var bot = ('@' + twitch_config.nickname).toLowerCase();
    if (message.toLowerCase().search('@' + twitch_config.nickname.toLowerCase()) > -1)
    {
        var res = randomElement(['Мне кажется, что ','Я полагаю, что ', 'Что-то подсказывает мне, что ', 'Я не уверен, но по-видимому ', 'Очевидно, что ']) + magic_ball.answer(replaceString(",","",replaceString(bot,"",message.toLocaleLowerCase())).trim());
        return res;
    }
}


twitch_irc_client.on_message(function(user,message,callback,whisper_callback){

    online_users.add(user);

    if (message.startsWith('!coins'))
        whisper_callback(user, currency_getter(user) + ' coins');
    if (message.startsWith('!pvp'))
    {
        var username2 = message.split(' ')[1];
        var cost = (+message.split(' ')[2]);

        if (isNumeric(cost) && cost > 0)
        {
            if (currency_holder.withdraw_with_check(user, pvp_init_cost)) {
                var id = pvp_fight(user, username2, cost);
                whisper_callback(user, id);
                whisper_callback(username2, id);
            }
            else {
                callback(user + ' -> Недостаточно денег для pvp');
            }
        }
        else {
            callback(user + ' -> Недопустимая ставка');
        }
    }
    if (message.startsWith('!bet'))
    {
        var name = message.split(' ')[1];
        var value = message.split(' ')[2];
        var money = (+message.split(' ')[3]);
        console.log('money = ' + money);

        if (!isNumeric(money))
            twitch_irc_client.send_public_message(user, 'Невалидная ставка DansGame');
        else {
            if (currency_holder.withdraw_with_check(user, money)) {
                if (!bet_system.do_bet(name, user, value, money))
                    currency_holder.update_currency(user, money);
            }
            else {
                twitch_irc_client.send_public_message(user, 'Недостаточно средств! EleGiggle');
            }
        }
    }
    
    if (message.startsWith('!top'))
    {
        callback(user + ' -> Топ #' +currency_holder.get_top_position(user) + ' по монеткам! SeemsGood');
    }
    
    if (message.toLowerCase().startsWith('!hi'))
    {
        callback('HI! KappaRoss');
    }

    check_stationary_command(message, callback);

    cmd = magic_ball_func(message);
    if (cmd)
        callback(user + ' -> ' + cmd);

    quiz_game.check_answer(message,function (cost) {
        currency_holder.update_currency(user,cost);
        twitch_irc_client.action('Правильно ответил ' + user + '(' + message + ')');
    })


});

twitch_irc_client.on_whisper(function (username, message) {

    if (message.startsWith('!addcom') && check_mod(username))
    {
        var key = message.split(' ')[1];
        var value = message.split(' ').slice(2).join(' ');

        twitch_irc_client.action('Command !' + key + ' added');

        stationary_commands.add(key, value);
    }
    if (message.startsWith('!delcom') && check_mod(username))
    {
        var key = message.split(' ')[1];

        twitch_irc_client.action('Command !' + key + ' deleted');

        stationary_commands.delete(key);
    }

    if (message.startsWith('!pvp'))
    {
        var args = message.split(' ');
        var id = args[1];
        var turn = args.slice(2).join(' ');
        pvp_pool.receive_turn(id,username,turn);
    }
    if (message.startsWith('!newbet') && check_mod(username))
    {
        var name = message.split(' ')[1];
        var coef = (+message.split(' ')[2]);
        var hint = message.split(' ').slice(3).join(' ');

        if (isNumeric(coef))
        {
            bet_system.new_bet(name, coef, hint);

            twitch_irc_client.action('Стартовала новая ' + bet_system.gen_text(name, coef, hint) + ' PogChamp');
        }
    }

    if (message.startsWith('!closebet') && check_mod(username))
    {
        var name = message.split(' ')[1];
        bet_system.close_bet(name, function (message) {
            twitch_irc_client.action(message);
        });

    }

    if (message.startsWith('!resetbet') && check_mod(username))
    {
        var name = message.split(' ')[1];
        bet_system.close_bet(name, function (username, value) {
            currency_holder.update_currency(username, value);
        });

    }

    if (message.startsWith('!endbet') && check_mod(username))
    {
        var name = message.split(' ')[1];
        var value = message.split(' ')[2];

        var winners = [];

        bet_system.upload_result(name,value,function (winner, win) {
            console.log(winner + ' has won ' + win);
            currency_holder.update_currency(winner,win);
            winners.push({name: winner, win : win});
        });

        winners.sort(function (a, b) {
            return -(a.win - b.win);
        });

        var winners_list = '';
        winners.slice(0,5).forEach(function (val) {
            winners_list += val.name + ' (' + val.win + '), ';
        });

        twitch_irc_client.action('Результаты ставки \"'+ bet_system.hints[name] + '\", победила ставка на \"' + value + '"\. Топ победители: ' + winners_list + ' Kreygasm');

    }
    if (message.startsWith('!showbets') && check_mod(username))
    {
        bet_system.show_active_bets(function (hint) {
            twitch_irc_client.action('Активна ставка ' + hint);
        });
    }
    
    if (message.startsWith('!give') && check_mod(username))
    {
        var giving = message.split(' ')[2];
        var to = message.split(' ')[1];
        if (isNumeric(giving))
        {
            currency_holder.update_currency(to, giving);
            twitch_irc_client.whisper(to,username + ' послал вам подарок в виде ' + giving + ' монет! ShibeZ');
        }
    }

    if (message.startsWith('!give') && (!check_mod(username)))
    {
        var giving = (+message.split(' ')[2]);
        var to = message.split(' ')[1];
        if (isNumeric(giving) && (giving > 0) && currency_holder.withdraw_with_check(username,giving))
        {
            currency_holder.update_currency(to, giving);
            twitch_irc_client.whisper(to,username + ' послал вам подарок в виде ' + giving + ' монет! ShibeZ');
        }
    }

    if (message.startsWith('!question') && check_mod(username))
    {
        var ms = message.split(' ');
        var cost = ms[ms.length - 1];
        var question = ms.slice(1,ms.length - 1).join(' ');

        if (!isNumeric(cost))
        {
            question += ' ' + cost;
            cost = 100;
        }

        quiz_game.add_question(question, cost);
        twitch_irc_client.action('Вопрос: ' + question + '. Цена вопроса = ' + cost + ' SuperVinlin');
    }

    if (message.startsWith('!answer') && check_mod(username))
    {
        quiz_game.add_answer(message.split(' ').slice(1).join(' '));
    }
	
	if (message.startsWith('!say') && check_mod(username))
    {
        twitch_irc_client.say(message.split(' ').slice(1).join(' '));
    }

});

setInterval(function () {

    online_users.forEach(function (username) {
        if (username.toLowerCase() != twitch_config.nickname.toLowerCase()) {
           currency_holder.update_currency(username, coins_period_value);
        }
    })

},coins_period_seconds * 1000);