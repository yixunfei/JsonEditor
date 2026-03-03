import { JsonNode } from '../types/json';

/**
 * 获取值类型
 * 用于确定JSON值的具体数据类型
 * @param value 任意值
 * @returns JsonNode类型枚举之一
 */
export function getValueType(value: any): JsonNode['type'] {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value as JsonNode['type'];
}

/**
 * 将JSON数据解析为树状结构
 * 将普通的JavaScript对象转换为具有层级关系的节点树
 * @param data 要解析的JSON数据
 * @param key 节点键名，默认为'root'
 * @param path 节点路径，默认为空
 * @returns 解析后的JsonNode节点
 */
export function parseJsonToTree(data: any, key: string = 'root', path: string = ''): JsonNode {
  const type = getValueType(data);
  const node: JsonNode = {
    key,
    value: data,
    type,
    path: path || key
  };

  if (type === 'object' && data !== null) {
    node.children = Object.keys(data).map(k => parseJsonToTree(data[k], k, path ? `${path}.${k}` : k));
    node.expanded = true;
  } else if (type === 'array') {
    node.children = data.map((item: any, index: number) =>
      parseJsonToTree(item, String(index), path ? `${path}[${index}]` : `[${index}]`)
    );
    node.expanded = true;
  }

  return node;
}

/**
 * 从树状结构重建JSON数据
 * 将带有层级关系的节点树转换回标准的JavaScript对象
 * @param node 树节点
 * @returns 重建后的JSON数据
 */
export function reconstructJson(node: JsonNode): any {
  if (node.type === 'object') {
    const obj: any = {};
    node.children?.forEach(child => {
      obj[child.key] = reconstructJson(child);
    });
    return obj;
  } else if (node.type === 'array') {
    return node.children?.map(child => reconstructJson(child)) ?? [];
  }
  return node.value;
}