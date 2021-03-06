import { connect } from 'react-redux';
import Conversation from './Conversation';
import {
  fetchBotResponse,
  addUserInputToStack,
  updateBotMessage,
  startNewConversation,
} from '../actions';

function addMessageToDisplayList(displayedMessages, hiddenMessages, dispatch) {
  const speed = {
    fast: 1500,
    slow: 5000,
    superslow: 8000,
  };

  const timeDelay = hiddenMessages[0].timeDelay || 'fast';

  setTimeout(() => {
    const updatedMessage = hiddenMessages[0];
    updatedMessage.toDisplay = true;
    dispatch(updateBotMessage(updatedMessage));
  },
  speed[timeDelay]);
}

const mapStateToProps = (state) => ({
  messages: state.messages,
  displayedMessages: state.messages.filter((message) => message.toDisplay === true),
  hiddenMessages: state.messages.filter((message) => message.toDisplay === false),
  lang: state.language,
  conversationId: state.conversation.conversationId,
  minimised: state.minimised,
});

const mapDispatchToProps = (dispatch) => ({
  initialBotMessageHandler: () => {
    dispatch(startNewConversation());
  },
  inputHandler: (data, conversationId, previousMessageId, previousMessageStoryblokId) => {
    dispatch(fetchBotResponse({
      speech: data.postback,
      conversationId,
      selectedTags: data.selectedTags,
      previousMessageId,
      previousMessageStoryblokId,
    }));

    data.text.forEach((text) => {
      dispatch(addUserInputToStack(text));
    });
  },
  queueNextMessage: (displayedMessages, hiddenMessages) => {
    if (hiddenMessages.length > 0) {
      addMessageToDisplayList(displayedMessages, hiddenMessages, dispatch);
    }
  },
});

const mergeProps = (propsFromState, propsFromDispatch) => ({
  ...propsFromState,
  ...propsFromDispatch,
  inputHandler: (data) => propsFromDispatch.inputHandler(
    data,
    propsFromState.conversationId,
    propsFromState.displayedMessages.slice(-1)[0].previousMessageId,
    propsFromState.displayedMessages.slice(-1)[0].previousMessageStoryblokId,
  ),
  queueNextMessage: () => propsFromDispatch.queueNextMessage(
    propsFromState.displayedMessages,
    propsFromState.hiddenMessages,
  ),
});

const ConversationContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(Conversation);

export default ConversationContainer;
