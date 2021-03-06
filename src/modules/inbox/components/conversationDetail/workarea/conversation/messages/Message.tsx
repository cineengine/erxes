import * as React from 'react';
import { IMessage } from '../../../../../types';
import {
  AppMessage,
  FacebookMessage,
  FormMessage,
  SimpleMessage,
  TwitterMessage
} from './';

type Props = {
  message: IMessage;
  isSameUser: boolean;
  conversationFirstMessage: IMessage;
};

function Message(props: Props) {
  const { message, isSameUser } = props;

  if (message.formWidgetData) {
    return <FormMessage {...props} />;
  }

  if (message.facebookData) {
    return <FacebookMessage {...props} />;
  }

  if (message.twitterData) {
    return <TwitterMessage {...props} />;
  }

  if (message.messengerAppData) {
    return <AppMessage message={message} />;
  }

  return (
    <SimpleMessage
      message={message}
      isStaff={message.userId ? true : false}
      isSameUser={isSameUser}
    />
  );
}

export default Message;
