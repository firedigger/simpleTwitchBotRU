
function Quiz_game()
{
    this.question = '';
    this.answer = '';
    this.cost = 0;
}

Quiz_game.prototype.add_question = function (question, cost)
{
    this.question = question;
    this.cost = cost;
};

Quiz_game.prototype.add_answer = function (answer)
{
    this.answer = answer.toLowerCase();
};

Quiz_game.prototype.check_answer = function (answer, callback)
{
    if (this.question && answer.toLowerCase() == this.answer)
    {
        this.question = undefined;
        callback(this.cost);
    }
};

module.exports = Quiz_game;