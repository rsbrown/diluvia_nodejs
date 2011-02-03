var Chat = function(parent) {
    this._chatMessageElement = $('<div id="chat_messages"></div>');
    $(parent).append(this._chatMessageElement);
};

Chat.prototype = {
    addMessage: function(text) {
        var msgDiv = $('<div class="chat_message"></div>');
        msgDiv.html(text);
        this._chatMessageElement.append(msgDiv);
        this._chatMessageElement.scrollTop(10000000);
    }
};

