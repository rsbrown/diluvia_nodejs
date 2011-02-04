var Chat = function(parent) {
    this._chatMessageElement = $('<div id="chat_messages"></div>');
    $(parent).append(this._chatMessageElement);
};

Chat.prototype = {
    addMessage: function(msgData) {
        var msgDiv  = $('<div class="chat_message"></div>'),
            text    = msgData.text;
            color   = msgData.color;
        
        msgDiv.css({ color: color });
        msgDiv.html(text);
        
        this._chatMessageElement.append(msgDiv);
        this._chatMessageElement.scrollTop(10000000); // TODO: this is kind of a hack
    }
};

