import { LightningElement } from "lwc";

export default class WordleUtils extends LightningElement {}

export const devlog = (isDevLogsActive = false, ...args) => {
  if (isDevLogsActive) {
    console.log(...args);
  }
};