import { ApplicationError } from '@/protocols';

export function duplicatedEmailError(): ApplicationError {
  return {
    name: 'DuplicatedEmailError',
    message: 'There is already an user with given email',
  };
}

export function duplicatedTitleError(): ApplicationError {
  return {
    name: 'DuplicatedTitleError',
    message: 'There is already a credential with given title',
  };
}
