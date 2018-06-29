import Render from './cartridge/pong.js';
import { name, description, version, url } from '../version.json';

require('../resources/styles/styles.css');

const args = [
  `\n${name} %c ver ${version} \n`,
  'background: #000; padding:5px 0;border-top-left-radius:10px;border-bottom-left-radius:10px;color:#88AAff;',
  `\n${description} \n${url} \n\n`
];

try {
  window.console.log.apply(console, args);
} catch (e) {
  window.console.log(name + ' : ' + version);
}

window.onload = () => {
  const demo = new Render();
  return demo;
};
