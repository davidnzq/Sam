/**
 * LongPort AI 助手 - 优化记录管理器
 * 
 * 用于管理文本优化历史记录，提供记录的保存、查询、删除等功能
 */

// 优化统计信息接口
export interface OptimizationStats {
  originalLength: number;
  optimizedLength: number;
  lengthDifference: number;
  percentageChange: number;
  processingTime?: number;
}

// 优化模式枚举
export enum OptimizationMode {
  BASIC = 'basic',
  STRICT = 'strict'
}

// 优化记录接口
export interface OptimizationRecord {
  id: string;
  timestamp: number;
  sourceUrl: string;
  sourceDomain: string;
  originalText: string;
  optimizedText: string;
  mode: OptimizationMode;
  stats: OptimizationStats;
}

// 记录过滤条件接口
export interface RecordFilter {
  startDate?: number;
  endDate?: number;
  domain?: string;
  searchText?: string;
  mode?: OptimizationMode;
}

// 记录管理器类
class RecordManager {
  private static instance: RecordManager;
  private readonly STORAGE_KEY = 'optimizationRecords';
  private readonly MAX_RECORDS = 100; // 最大记录数量
  private readonly DEFAULT_RETENTION_DAYS = 30; // 默认保留天数

  // 单例模式
  public static getInstance(): RecordManager {
    if (!RecordManager.instance) {
      RecordManager.instance = new RecordManager();
    }
    return RecordManager.instance;
  }

  // 私有构造函数
  private constructor() {}

  /**
   * 保存优化记录
   * @param record 要保存的记录（不包含id和timestamp）
   * @returns 保存后的完整记录
   */
  public async saveRecord(record: Omit<OptimizationRecord, 'id' | 'timestamp'>): Promise<OptimizationRecord> {
    // 获取现有记录
    const records = await this.getAllRecords();
    
    // 创建新记录
    const newRecord: OptimizationRecord = {
      ...record,
      id: this.generateId(),
      timestamp: Date.now()
    };
    
    // 添加到记录列表
    records.unshift(newRecord);
    
    // 如果记录数量超过最大值，删除最旧的记录
    if (records.length > this.MAX_RECORDS) {
      records.splice(this.MAX_RECORDS);
    }
    
    // 保存记录
    await this.saveAllRecords(records);
    
    return newRecord;
  }

  /**
   * 获取所有优化记录
   * @returns 优化记录数组
   */
  public async getAllRecords(): Promise<OptimizationRecord[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get(this.STORAGE_KEY, (result) => {
        const records = result[this.STORAGE_KEY] || [];
        resolve(records);
      });
    });
  }

  /**
   * 根据ID获取单条记录
   * @param id 记录ID
   * @returns 找到的记录，如果不存在则返回null
   */
  public async getRecordById(id: string): Promise<OptimizationRecord | null> {
    const records = await this.getAllRecords();
    return records.find(record => record.id === id) || null;
  }

  /**
   * 根据条件筛选记录
   * @param filter 筛选条件
   * @returns 符合条件的记录数组
   */
  public async filterRecords(filter: RecordFilter): Promise<OptimizationRecord[]> {
    const records = await this.getAllRecords();
    
    return records.filter(record => {
      // 按日期范围筛选
      if (filter.startDate && record.timestamp < filter.startDate) {
        return false;
      }
      if (filter.endDate && record.timestamp > filter.endDate) {
        return false;
      }
      
      // 按域名筛选
      if (filter.domain && record.sourceDomain !== filter.domain) {
        return false;
      }
      
      // 按优化模式筛选
      if (filter.mode && record.mode !== filter.mode) {
        return false;
      }
      
      // 按文本内容搜索
      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        const originalLower = record.originalText.toLowerCase();
        const optimizedLower = record.optimizedText.toLowerCase();
        
        if (!originalLower.includes(searchLower) && !optimizedLower.includes(searchLower)) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * 删除单条记录
   * @param id 要删除的记录ID
   * @returns 是否成功删除
   */
  public async deleteRecord(id: string): Promise<boolean> {
    const records = await this.getAllRecords();
    const initialLength = records.length;
    
    const filteredRecords = records.filter(record => record.id !== id);
    
    if (filteredRecords.length === initialLength) {
      // 没有记录被删除
      return false;
    }
    
    await this.saveAllRecords(filteredRecords);
    return true;
  }

  /**
   * 清空所有记录
   * @returns 是否成功清空
   */
  public async clearAllRecords(): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.storage.local.remove(this.STORAGE_KEY, () => {
        if (chrome.runtime.lastError) {
          console.error('清空记录失败:', chrome.runtime.lastError);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * 清理过期记录
   * @param retentionDays 保留天数，默认为30天
   * @returns 删除的记录数量
   */
  public async cleanupExpiredRecords(retentionDays: number = this.DEFAULT_RETENTION_DAYS): Promise<number> {
    const records = await this.getAllRecords();
    const initialLength = records.length;
    
    // 计算截止时间戳
    const cutoffTimestamp = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    
    // 过滤掉过期记录
    const filteredRecords = records.filter(record => record.timestamp >= cutoffTimestamp);
    
    // 计算删除的记录数量
    const deletedCount = initialLength - filteredRecords.length;
    
    if (deletedCount > 0) {
      await this.saveAllRecords(filteredRecords);
    }
    
    return deletedCount;
  }

  /**
   * 导出记录为JSON字符串
   * @returns JSON格式的记录数据
   */
  public async exportRecords(): Promise<string> {
    const records = await this.getAllRecords();
    return JSON.stringify(records, null, 2);
  }

  /**
   * 导入记录
   * @param jsonData JSON格式的记录数据
   * @param replace 是否替换现有记录，默认为false（合并）
   * @returns 导入的记录数量
   */
  public async importRecords(jsonData: string, replace: boolean = false): Promise<number> {
    try {
      const importedRecords = JSON.parse(jsonData) as OptimizationRecord[];
      
      if (!Array.isArray(importedRecords)) {
        throw new Error('导入数据格式错误');
      }
      
      // 验证记录格式
      for (const record of importedRecords) {
        if (!this.isValidRecord(record)) {
          throw new Error('导入数据包含无效记录');
        }
      }
      
      if (replace) {
        // 替换现有记录
        await this.saveAllRecords(importedRecords);
      } else {
        // 合并记录
        const existingRecords = await this.getAllRecords();
        
        // 使用Map去重，以ID为键
        const recordMap = new Map<string, OptimizationRecord>();
        
        // 先添加现有记录
        existingRecords.forEach(record => {
          recordMap.set(record.id, record);
        });
        
        // 再添加导入记录（如有重复ID则覆盖）
        importedRecords.forEach(record => {
          recordMap.set(record.id, record);
        });
        
        // 转换回数组并按时间戳排序
        const mergedRecords = Array.from(recordMap.values())
          .sort((a, b) => b.timestamp - a.timestamp);
        
        // 如果超过最大记录数，截断
        const finalRecords = mergedRecords.slice(0, this.MAX_RECORDS);
        
        await this.saveAllRecords(finalRecords);
      }
      
      return importedRecords.length;
    } catch (error) {
      console.error('导入记录失败:', error);
      throw error;
    }
  }

  /**
   * 获取记录统计信息
   * @returns 记录统计信息
   */
  public async getRecordStats(): Promise<{
    totalCount: number;
    oldestTimestamp: number | null;
    newestTimestamp: number | null;
    domainCounts: Record<string, number>;
    modeCounts: Record<string, number>;
  }> {
    const records = await this.getAllRecords();
    
    if (records.length === 0) {
      return {
        totalCount: 0,
        oldestTimestamp: null,
        newestTimestamp: null,
        domainCounts: {},
        modeCounts: {}
      };
    }
    
    // 初始化统计
    let oldestTimestamp = records[0].timestamp;
    let newestTimestamp = records[0].timestamp;
    const domainCounts: Record<string, number> = {};
    const modeCounts: Record<string, number> = {};
    
    // 遍历记录进行统计
    for (const record of records) {
      // 更新时间戳
      if (record.timestamp < oldestTimestamp) {
        oldestTimestamp = record.timestamp;
      }
      if (record.timestamp > newestTimestamp) {
        newestTimestamp = record.timestamp;
      }
      
      // 统计域名
      if (domainCounts[record.sourceDomain]) {
        domainCounts[record.sourceDomain]++;
      } else {
        domainCounts[record.sourceDomain] = 1;
      }
      
      // 统计模式
      if (modeCounts[record.mode]) {
        modeCounts[record.mode]++;
      } else {
        modeCounts[record.mode] = 1;
      }
    }
    
    return {
      totalCount: records.length,
      oldestTimestamp,
      newestTimestamp,
      domainCounts,
      modeCounts
    };
  }

  // 私有方法：保存所有记录
  private async saveAllRecords(records: OptimizationRecord[]): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [this.STORAGE_KEY]: records }, () => {
        if (chrome.runtime.lastError) {
          console.error('保存记录失败:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  // 私有方法：生成唯一ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }

  // 私有方法：验证记录格式
  private isValidRecord(record: any): boolean {
    return (
      typeof record === 'object' &&
      typeof record.id === 'string' &&
      typeof record.timestamp === 'number' &&
      typeof record.sourceUrl === 'string' &&
      typeof record.sourceDomain === 'string' &&
      typeof record.originalText === 'string' &&
      typeof record.optimizedText === 'string' &&
      typeof record.mode === 'string' &&
      typeof record.stats === 'object' &&
      typeof record.stats.originalLength === 'number' &&
      typeof record.stats.optimizedLength === 'number'
    );
  }
}

// 导出单例实例
export const recordManager = RecordManager.getInstance();
