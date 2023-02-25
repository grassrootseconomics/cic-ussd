
import { UssdContext } from "@utils/context";

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