const { readFileSync, writeFileSync } = require('fs');
const content = readFileSync('frontend-react/src/js/public.js', 'utf8');

const getStr = (str, start, end) => {
  const i = str.indexOf(start);
  if (i === -1) return '';
  const j = str.indexOf(end, i + start.length);
  return str.substring(i + start.length, j);
};

console.log(getStr(content, 'export function authScreen', ';}'));
