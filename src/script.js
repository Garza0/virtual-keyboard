/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/extensions
import { keyMap, keys } from './keys.js';

window.onkeydown = (e) => e.preventDefault();

let language;
const valueOrShiftValue = 'value';
let keyboardKeys;
let capsLkState = false;
let shiftState = false;

const textarea = document.createElement('textarea');
const mainSection = document.createElement('div');
mainSection.classList.add('mainSection');
const keyboardSection = document.createElement('div');
keyboardSection.classList.add('keyboardSection');
const legend = document.createElement('div');
legend.classList.add('legend');
legend.insertAdjacentHTML('beforeend', '<p>The Virtual keyboard was created in <b>Windows</b><br>Language switch hotkey - <b>Shift + Alt</b> or <b>Win</b></p>');

document.body.appendChild(mainSection);
mainSection.appendChild(textarea);
mainSection.appendChild(keyboardSection);
mainSection.appendChild(legend);

const saveLangState = () => {
  sessionStorage.setItem('keyboard-language', language);
};

const restoreLangState = () => {
  language = sessionStorage.getItem('keyboard-language') ? sessionStorage.getItem('keyboard-language') : 'en';
};


function returnCharacterFromKeysObj(keyCodeAttribute, keyboardLanguage, characterCase) {
  if (Object.prototype.hasOwnProperty.call(keys[keyCodeAttribute], characterCase)) {
    return keys[keyCodeAttribute][characterCase];
  }

  if (Object.prototype.hasOwnProperty.call(keys[keyCodeAttribute], keyboardLanguage)) {
    if (Object.prototype.hasOwnProperty
      .call(keys[keyCodeAttribute][keyboardLanguage], characterCase)) {
      return keys[keyCodeAttribute][keyboardLanguage][characterCase];
    }
    return keys[keyCodeAttribute][keyboardLanguage].value;
  }
  return keys[keyCodeAttribute].value;
}

const populateKeys = (keyLine) => keyLine.map((key) => `<div class="keyboard__key ${key}" keycode="${key}"> </div>`).join('\n');

const populateLines = (keyboard) => keyboard.map((line) => `<div class="keyboard__line"> ${populateKeys(line)} </div>`).join('\n');

function keyboardRenderWithoutCharacters() {
  keyboardSection.innerHTML = populateLines(keyMap);

  keyboardKeys = document.querySelectorAll('.keyboard__key');
}

function keyboardCharactersRender(lang, shiftValue) {
  document.querySelectorAll('.keyboard__key').forEach((element) => {
    const keyCodeAttributeValue = element.attributes.keycode.value;
    element.innerText = returnCharacterFromKeysObj(keyCodeAttributeValue, lang, shiftValue);
  });
}

function changeLangHandler() {
  if (language === 'en') language = 'ru';
  else language = 'en';
  saveLangState();
  keyboardCharactersRender(language, valueOrShiftValue);
}

const getTextAreaSelectionPosition = () => ({
  start: textarea.selectionStart,
  end: textarea.selectionEnd,
});

function addCharacter(char) {
  const { start, end } = getTextAreaSelectionPosition();
  const textArr = textarea.value.split('');
  if (textarea.selectionEnd - textarea.selectionStart > 0) {
    textArr.splice(start, end - start, char);
    textarea.value = textArr.join('');
    textarea.selectionEnd = start + char.length;
  } else if (textarea.value.length > end) {
    textArr.splice(end, 0, char);
    textarea.value = textArr.join('');
    textarea.selectionEnd = start + char.length;
    textarea.selectionStart = textarea.selectionEnd;
  } else {
    textarea.value += char;
  }
}

function backspaceHandler() {
  const { start, end } = getTextAreaSelectionPosition();
  const textArr = textarea.value.split('');
  if (end - start > 0) {
    textArr.splice(start, end - start);
  } else {
    textArr.splice(end - 1, 1);
  }
  textarea.value = textArr.join('');
  textarea.selectionEnd = start - 1;
}

function deleteHandler() {
  const { start, end } = getTextAreaSelectionPosition();
  const textArr = textarea.value.split('');
  if (end - start > 0) {
    textArr.splice(start, end - start);
  } else {
    textArr.splice(end, 1);
  }
  textarea.value = textArr.join('');
  textarea.selectionEnd = start;
}

function moveTextCursor(buttonKeyCode) {
  switch (buttonKeyCode) {
    case 'arrowleft':
      textarea.selectionEnd -= 1;
      textarea.selectionStart = textarea.selectionEnd;
      return;
    case 'arrowright':
      textarea.selectionEnd += 1;
      textarea.selectionStart = textarea.selectionEnd;
      return;
    case 'arrowdown':
      if (textarea.selectionEnd + 119 <= textarea.value.length) {
        const diff = textarea.selectionEnd - textarea.selectionStart;
        textarea.selectionStart += (119 + diff);
      }
      return;
    case 'arrowup':
      if (textarea.selectionEnd - 119 >= 0) {
        textarea.selectionEnd -= 119;
        textarea.selectionStart = textarea.selectionEnd;
      }
      break;
    default:
      break;
  }
}


function capsLkAndShiftHandler() {
  if (capsLkState === true) {
    keyboardCharactersRender(language, 'value');
  } else {
    keyboardCharactersRender(language, 'shiftValue');
  }
  capsLkState = !capsLkState;
}

function onMouseDownOrOnKeyDownSwitchCase(keycodeAttributeValue, buttonInnerText) {
  switch (keycodeAttributeValue) {
    case 'shiftleft':
    case 'shiftright':
      shiftState = true;
      capsLkAndShiftHandler();
      return;
    case 'capslock':
      capsLkAndShiftHandler();
      return;
    case 'space':
      addCharacter(' ');
      return;
    case 'tab':
      addCharacter('  ');
      return;
    case 'enter':
      addCharacter('\n');
      return;
    case 'controlleft':
    case 'controlright':
    case 'contextmenu':
      return;
    case 'altleft':
    case 'altright':
      if (shiftState) {
        changeLangHandler();
      }
      return;
    case 'metaleft':
      changeLangHandler();
      return;
    case 'backspace':
      backspaceHandler();
      return;
    case 'delete':
      deleteHandler();
      return;
    case 'arrowleft':
      moveTextCursor('arrowleft');
      return;
    case 'arrowright':
      moveTextCursor('arrowright');
      return;
    case 'arrowdown':
      moveTextCursor('arrowdown');
      return;
    case 'arrowup':
      moveTextCursor('arrowup');
      return;

    default: addCharacter(buttonInnerText);
  }
}

function addMouseEvents() {
  keyboardKeys.forEach((element) => {
    element.onmousedown = function onMouseUp(e) {
      if (e.toElement.attributes.keycode.value === 'capslock') {
        this.classList.toggle('keyboard__key--active');
      } else {
        this.classList.add('keyboard__key--active');
      }

      onMouseDownOrOnKeyDownSwitchCase(e.toElement.attributes.keycode.value, this.innerText);
    };
  });

  keyboardKeys.forEach((element) => {
    element.onmouseup = function onMouseUp(e) {
      if (e.toElement.attributes.keycode.value !== 'capslock') {
        this.classList.remove('keyboard__key--active');
      }
      switch (e.toElement.attributes.keycode.value) {
        case 'shiftleft':
        case 'shiftright':
          shiftState = false;
          capsLkAndShiftHandler();
          return;
        default:
          break;
      }

      textarea.focus();
    };
  });
}

function addKeyboardEvents() {
  document.onkeydown = function onKeyDownKeyboard(event) {
    if (!keys[event.code.toLocaleLowerCase()]) { return; }
    const eventKey = document.querySelector(`[keycode="${event.code.toLowerCase()}"]`);

    if (event.code.toLowerCase() === 'capslock') {
      eventKey.classList.toggle('keyboard__key--active');
    } else {
      eventKey.classList.add('keyboard__key--active');
    }
    onMouseDownOrOnKeyDownSwitchCase(event.code.toLowerCase(), eventKey.innerText);
  };

  document.onkeyup = function onKeyUpKeyboard(event) {
    if (!keys[event.code.toLocaleLowerCase()]) { return; }
    const eventKey = document.querySelector(`[keycode="${event.code.toLowerCase()}"]`);
    if (event.code.toLowerCase() !== 'capslock') {
      eventKey.classList.remove('keyboard__key--active');
    }

    switch (event.code.toLowerCase()) {
      case 'shiftleft':
      case 'shiftright':
        shiftState = false;
        capsLkAndShiftHandler();
        return;
      default:
        break;
    }

    textarea.focus();
  };
}

window.onload = () => {
  restoreLangState();
  keyboardRenderWithoutCharacters();
  keyboardCharactersRender(language, valueOrShiftValue);
  addKeyboardEvents();
  addMouseEvents();
};
