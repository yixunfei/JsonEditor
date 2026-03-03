/**
 * JSON节点类型定义
 * 用于表示JSON数据在树形结构中的节点
 */
export interface JsonNode {
  key: string;                    // 节点键名
  value: any;                     // 节点值
  type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array'; // 数据类型
  children?: JsonNode[];          // 子节点数组
  expanded?: boolean;             // 是否展开
  path: string;                   // 完整路径标识
}