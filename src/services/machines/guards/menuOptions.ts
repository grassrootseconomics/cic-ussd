import { UssdContext } from '../../../helpers/context';

/**
 * `isMenuOption` is a function that takes in two parameters, `expectedValue` and
 * `input`, and returns a boolean value that is true if the `input` is equal to the
 * `expectedValue`
 * @param {string} expectedValue - The value that the user is expected to input.
 * @param {string} input - The input from the user.
 * @returns A function that takes a context and returns a boolean
 */
function isMenuOption(expectedValue: string, input: string) {
  return input === expectedValue;
}

export function isOptionZeroSelected(context: UssdContext) {
  return isMenuOption('0', context.actorInput);
}

export function isOptionOneSelected(context: UssdContext) {
  return isMenuOption('1', context.actorInput);
}

export function isOptionTwoSelected(context: UssdContext) {
  return isMenuOption('2', context.actorInput);
}

export function isOptionThreeSelected(context: UssdContext) {
  return isMenuOption('3', context.actorInput);
}

export function isOptionFourSelected(context: UssdContext) {
  return isMenuOption('4', context.actorInput);
}

export function isOptionSevenSelected(context: UssdContext) {
  return isMenuOption('5', context.actorInput);
}

export function isOptionSixSelected(context: UssdContext) {
  return isMenuOption('6', context.actorInput);
}

export function isOptionNineSelected(context: UssdContext) {
  return isMenuOption('9', context.actorInput);
}
