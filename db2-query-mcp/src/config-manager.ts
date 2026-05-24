/**
 * 配置管理模块
 * 负责从环境变量或配置文件加载数据库连接配置
 */

export interface Db2Config {
  /** JDBC URL，格式: DATABASE=xxx;HOSTNAME=xxx;PORT=xxx;PROTOCOL=TCPIP */
  jdbcUrl: string;
  /** 数据库用户名 */
  username: string;
  /** 数据库密码 */
  password: string;
  /** 默认 Schema */
  schema?: string;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: Db2Config | null = null;

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * 从环境变量加载配置
   */
  loadFromEnv(): Db2Config {
    const jdbcUrl = process.env.DB2_JDBC_URL;
    const username = process.env.DB2_USERNAME;
    const password = process.env.DB2_PASSWORD;
    const schema = process.env.DB2_SCHEMA;

    if (!jdbcUrl || !username || !password) {
      throw new Error(
        "缺少必要的数据库配置环境变量: DB2_JDBC_URL, DB2_USERNAME, DB2_PASSWORD"
      );
    }

    this.config = {
      jdbcUrl,
      username,
      password,
      schema,
    };

    return this.config;
  }

  /**
   * 获取当前配置
   */
  getConfig(): Db2Config {
    if (!this.config) {
      return this.loadFromEnv();
    }
    return this.config;
  }

  /**
   * 设置配置
   */
  setConfig(config: Db2Config): void {
    this.config = config;
  }

  /**
   * 构建完整的连接字符串
   */
  buildConnectionString(): string {
    const config = this.getConfig();
    // ibm_db 使用完整的连接字符串格式
    return `${config.jdbcUrl};UID=${config.username};PWD=${config.password}`;
  }

  /**
   * 验证配置是否完整
   */
  validateConfig(config: Partial<Db2Config>): string[] {
    const errors: string[] = [];

    if (!config.jdbcUrl) {
      errors.push("缺少 JDBC URL");
    }
    if (!config.username) {
      errors.push("缺少用户名");
    }
    if (!config.password) {
      errors.push("缺少密码");
    }

    return errors;
  }
}
