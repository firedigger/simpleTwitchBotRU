var request = require('request');

function Magic_ball(){
    this.past_periods = ['день', 'месяц' , 'неделю', 'год'];
    this.memes = ['никогда Kappa', 'в год фаердиггера KappaClaus', 'в 2076 4Head', 'сию минуту! SMOrc'];
    this.meme_people = ['firedigger','батя','Cookiezi','Hikiezi','Hookiezi','Rafis','Владимир Владимирович Путин','Barack Obama', 'Папич','Мэдисон','Алла Пугачева','Максим Глакин','Rhijitsu','я','John Kappa !','долбаеб','Садам Хуйссейн ANELE ','Иисус Христос','Господь Бог','Chitoge','Chocola','ванга','Naumich','talala','cr1m','ADEN','dezodor'];
    this.number_memes = ['over 9000','нихуя','пиздецки много','больше, чем звезд на небе и больше, чем песчинок в песке'];
}

function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomArbitrary(min, max)
{
    return Math.random() * (max - min) + min;
}


Magic_ball.prototype.answer = function (question) {

    if (question.indexOf('или') != -1)
    {
        var options = question.split(' ');
        var i;
        for(i = 0; i < options.length; ++i)
        {
            if (options[i] == 'или')
            {
                break;
            }
        }
        var f = Math.random();
        return f > 0.5 ? options[i-1] : options[i+1];
    }

    if (question.startsWith('когда'))
    {
        var f = Math.random();

        //memes
        if (f > 0.15 + 0.10 + 0.32 + 0.25)
        {
            return randomElement(this.memes);
        }

        //future "in"
        if (f > 0.15 + 0.10 + 0.32)
        {
            return 'через ' + randomElement(this.past_periods);
        }

        //future date
        if (f > 0.15 + 0.10)
        {
            return randomDate(new Date(Date.now()),new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000)).toDateString();
        }

        //past date
        if (f > 0.15)
        {
            return randomDate(new Date(Date.now()),new Date(Date.now() - 100 * 365 * 24 * 60 * 60 * 1000)).toDateString();
        }

        return randomElement(this.past_periods) + ' назад';
    }

    if (question.startsWith('кто') || question.startsWith('кого') || question.startsWith('кому') || question.startsWith('с кем'))
    {
        return randomElement(this.meme_people);
    }

    /*if (question.startsWith('где'))
    {
        var lat = getRandomArbitrary(0,90);
        var lon = getRandomArbitrary(0,90);
        var google_key = 'AIzaSyAoG53qp3Lvf2Ajnt0bYqHIYwG_P3MMo9I';
        var address = request('http://maps.googleapis.com/maps/api/geocode/json?key='+ google_key + '&latlng='+lat+','+lon+'&sensor=true',function (error, response, body) {
            if (!error && response.statusCode == 200) {
                return address.results.formatted_address;
            }
        });
    }*/

    if (question.startsWith('сколько'))
    {
        var f = Math.random();

        if (f > 0.6)
        {
            return Math.floor(getRandomArbitrary(0,100));
        }
        if (f > 0.6 + 0.2)
        {
            return Math.floor(getRandomArbitrary(1000,10000));
        }
        return randomElement(this.number_memes);
    }


    if (question.startsWith('насколько'))
    {
        var percent = Math.random() * 100;

        return 'на ' + Math.floor(percent) + '%';
    }

    return Math.random() >= 0.5 ? 'да' : 'нет';

};



module.exports = Magic_ball;