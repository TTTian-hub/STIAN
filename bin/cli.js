#!/usr/bin/env node

const { program } = require('commander');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// 获取包信息
const pkg = require('../package.json');

// 获取项目根目录
const projectRoot = path.resolve(__dirname, '..');

// 用户配置目录
const configDir = path.join(os.homedir(), '.fortuning-ai');
const envFile = path.join(configDir, '.env.local');

program
  .name('fortuning-ai')
  .description('AI智能命理占卜平台 - 八字、塔罗、星座、奇门遁甲等')
  .version(pkg.version);

program
  .command('start')
  .alias('s')
  .description('启动 Fortuning AI 服务')
  .option('-p, --port <port>', '指定端口', '3000')
  .option('-H, --host <host>', '指定主机', '0.0.0.0')
  .action(async (options) => {
    // 检查配置
    if (!fs.existsSync(envFile)) {
      console.log('⚠️  未找到配置文件，请先运行: fortuning-ai config');
      process.exit(1);
    }

    // 复制配置到项目目录
    fs.copyFileSync(envFile, path.join(projectRoot, '.env.local'));

    console.log(`🚀 启动 Fortuning AI...`);
    console.log(`📍 访问地址: http://${options.host === '0.0.0.0' ? 'localhost' : options.host}:${options.port}`);
    console.log('');

    // 启动 Next.js
    const next = spawn('npm', ['run', 'start'], {
      cwd: projectRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: options.port,
        HOSTNAME: options.host
      }
    });

    next.on('close', (code) => {
      process.exit(code);
    });
  });

program
  .command('dev')
  .alias('d')
  .description('开发模式启动（支持热重载）')
  .option('-p, --port <port>', '指定端口', '3000')
  .action(async (options) => {
    // 检查配置
    if (!fs.existsSync(envFile)) {
      console.log('⚠️  未找到配置文件，请先运行: fortuning-ai config');
      process.exit(1);
    }

    // 复制配置到项目目录
    fs.copyFileSync(envFile, path.join(projectRoot, '.env.local'));

    console.log(`🚀 启动开发服务器...`);
    console.log(`📍 访问地址: http://localhost:${options.port}`);
    console.log('');

    // 启动开发服务器
    const next = spawn('npm', ['run', 'dev', '--', '-p', options.port], {
      cwd: projectRoot,
      stdio: 'inherit'
    });

    next.on('close', (code) => {
      process.exit(code);
    });
  });

program
  .command('config')
  .alias('c')
  .description('配置 AI API 密钥')
  .action(async () => {
    const inquirer = (await import('inquirer')).default;
    const chalk = (await import('chalk')).default;
    const boxen = (await import('boxen')).default;

    console.clear();
    console.log(boxen(chalk.cyan.bold('🔮 Fortuning AI 配置向导'), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }));

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: '选择 AI 提供商:',
        choices: [
          { name: 'DeepSeek (推荐)', value: 'deepseek' },
          { name: 'Kimi', value: 'kimi' },
          { name: 'GLM', value: 'glm' },
          { name: '自定义', value: 'custom' }
        ]
      },
      {
        type: 'input',
        name: 'apiKey',
        message: '输入 API Key:',
        validate: (input) => input.trim() !== '' || 'API Key 不能为空'
      },
      {
        type: 'input',
        name: 'baseUrl',
        message: '输入 API Base URL (可选，按回车使用默认):',
        when: (answers) => answers.provider === 'custom',
        default: 'https://api.deepseek.com'
      }
    ]);

    // 确保配置目录存在
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // 生成配置文件
    let envContent = '';

    switch (answers.provider) {
      case 'deepseek':
        envContent = `AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=${answers.apiKey}
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat`;
        break;
      case 'kimi':
        envContent = `AI_PROVIDER=kimi
ANTHROPIC_AUTH_TOKEN=${answers.apiKey}
ANTHROPIC_BASE_URL=https://api.kimi.com/coding/
ANTHROPIC_MODEL=kimi-k2.5`;
        break;
      case 'glm':
        envContent = `AI_PROVIDER=glm
GLM_API_KEY=${answers.apiKey}
GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4
GLM_MODEL=glm-4.7`;
        break;
      case 'custom':
        envContent = `AI_PROVIDER=custom
AI_API_KEY=${answers.apiKey}
AI_BASE_URL=${answers.baseUrl}`;
        break;
    }

    // 添加功能开关
    envContent += `

# 功能开关
ENABLE_HOROSCOPE=true
ENABLE_TAROT=true
ENABLE_BAZI=true
ENABLE_QIMEN=true
ENABLE_LIUYAO=true
ENABLE_SYNASTRY=true
ENABLE_HUANGLI=true`;

    fs.writeFileSync(envFile, envContent);

    console.log('');
    console.log(chalk.green('✅ 配置已保存!'));
    console.log(chalk.gray(`📁 配置文件: ${envFile}`));
    console.log('');
    console.log(chalk.cyan('现在可以运行:'));
    console.log(chalk.white('  fortuning-ai start    # 启动服务'));
    console.log(chalk.white('  fortuning-ai dev      # 开发模式'));
    console.log('');
  });

program
  .command('status')
  .description('查看配置状态')
  .action(async () => {
    const chalk = (await import('chalk')).default;

    console.log(chalk.cyan.bold('🔮 Fortuning AI 状态'));
    console.log('');

    // 检查配置
    if (fs.existsSync(envFile)) {
      console.log(chalk.green('✅ 配置文件存在'));
      console.log(chalk.gray(`   位置: ${envFile}`));

      // 读取并显示配置（隐藏 API key）
      const content = fs.readFileSync(envFile, 'utf-8');
      const provider = content.match(/AI_PROVIDER=(.+)/)?.[1] || 'unknown';
      console.log(chalk.gray(`   提供商: ${provider}`));
    } else {
      console.log(chalk.red('❌ 配置文件不存在'));
      console.log(chalk.gray('   运行 fortuning-ai config 进行配置'));
    }

    console.log('');
    console.log(chalk.cyan('可用命令:'));
    console.log('  fortuning-ai config   配置 API 密钥');
    console.log('  fortuning-ai start    启动服务');
    console.log('  fortuning-ai dev      开发模式');
  });

// 如果没有参数，显示帮助
if (process.argv.length === 2) {
  program.help();
}

program.parse();
