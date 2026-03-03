/**
 * JSON转XML格式
 * 将JSON对象转换为类似的XML格式
 * @param obj JSON对象
 * @param indent 缩进字符串，默认为空
 * @returns XML格式的字符串
 */
export function jsonToXml(obj: any, indent: string = ''): string {
  let xml = '';
  if (Array.isArray(obj)) {
    for (const item of obj) {
      xml += indent + '<item>\n' + jsonToXml(item, indent + '  ') + indent + '</item>\n';
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
      xml += indent + '<' + safeKey + '>\n' + jsonToXml(obj[key], indent + '  ') + indent + '</' + safeKey + '>\n';
    }
  } else if (obj === null) {
    xml += indent + '<null />\n';
  } else {
    xml += indent + String(obj) + '\n';
  }
  return xml;
}

/**
 * JSON转YAML格式
 * 将JSON对象转换为YAML格式
 * @param obj JSON对象
 * @param indent 当前缩进级别，默认为0
 * @returns YAML格式的字符串
 */
export function jsonToYaml(obj: any, indent: number = 0): string {
  let yaml = '';
  const spaces = '  '.repeat(indent);

  if (Array.isArray(obj)) {
    for (const item of obj) {
      yaml += spaces + '-\n' + jsonToYaml(item, indent + 1);
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      const val = obj[key];
      if (typeof val === 'object' && val !== null) {
        yaml += spaces + key + ':\n' + jsonToYaml(val, indent + 1);
      } else {
        yaml += spaces + key + ': ' + (val === null ? 'null' : 
                  typeof val === 'string' ? `"${val}"` : val) + '\n';
      }
    }
  } else {
    yaml += spaces + (obj === null ? 'null' : 
              typeof obj === 'string' ? `"${obj}"` : obj) + '\n';
  }
  return yaml;
}

/**
 * JSON转CSV格式
 * 将JSON对象转换为CSV格式
 * @param obj JSON对象
 * @returns CSV格式的字符串
 */
export function jsonToCsv(obj: any): string {
  const rows: string[] = [];
  const headers: string[] = [];

  function flatten(o: any, prefix: string = '') {
    if (Array.isArray(o)) {
      o.forEach((item, i) => flatten(item, prefix ? `${prefix}[${i}]` : `[${i}]`));
    } else if (typeof o === 'object' && o !== null) {
      for (const key in o) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof o[key] === 'object' && o[key] !== null) {
          flatten(o[key], newKey);
        } else {
          if (!headers.includes(newKey)) headers.push(newKey);
        }
      }
    } else {
      if (!headers.includes(prefix)) headers.push(prefix);
    }
  }

  function extractRow(o: any): string[] {
    return headers.map(h => {
      const parts = h.split('.');
      let val: any = o;
      for (const p of parts) {
        if (p.startsWith('[') && p.endsWith(']')) {
          const idx = parseInt(p.slice(1, -1));
          val = val?.[idx];
        } else {
          val = val?.[p];
        }
      }
      if (val === undefined || val === null) return '';
      if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
      return String(val);
    });
  }

  if (Array.isArray(obj)) {
    flatten(obj);
    rows.push(headers.join(','));
    for (const item of obj) {
      flatten(item);
      rows.push(extractRow(item).join(','));
    }
  } else if (typeof obj === 'object' && obj !== null) {
    flatten(obj);
    rows.push(headers.join(','));
    rows.push(extractRow(obj).join(','));
  }

  return rows.join('\n');
}