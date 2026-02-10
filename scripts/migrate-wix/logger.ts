// Structured logging with file and console output
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import cliProgress from 'cli-progress'

export class MigrationLogger {
  private logFilePath: string
  private errorLogFilePath: string
  private progressBar: cliProgress.SingleBar | null = null

  constructor(logFile: string, errorLogFile: string) {
    const scriptDir = resolve(__dirname)
    this.logFilePath = resolve(scriptDir, logFile)
    this.errorLogFilePath = resolve(scriptDir, errorLogFile)

    // Ensure directory exists
    const dir = dirname(this.logFilePath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    // Clear old logs
    writeFileSync(this.logFilePath, '')
    writeFileSync(this.errorLogFilePath, '')
  }

  private formatTimestamp(): string {
    return new Date().toISOString().replace('T', ' ').substring(0, 19)
  }

  private writeLog(level: string, message: string, toFile: string) {
    const logEntry = `[${this.formatTimestamp()}] ${level}: ${message}\n`
    appendFileSync(toFile, logEntry)
  }

  info(message: string) {
    console.log(`✓ ${message}`)
    this.writeLog('INFO', message, this.logFilePath)
  }

  warn(message: string) {
    console.log(`⚠ ${message}`)
    this.writeLog('WARN', message, this.logFilePath)
  }

  error(message: string, error?: Error | any) {
    const errorMessage = error instanceof Error
      ? `${message}: ${error.message}`
      : `${message}: ${JSON.stringify(error)}`

    console.error(`✗ ${errorMessage}`)
    this.writeLog('ERROR', errorMessage, this.errorLogFilePath)
    this.writeLog('ERROR', errorMessage, this.logFilePath)
  }

  success(message: string) {
    console.log(`✅ ${message}`)
    this.writeLog('SUCCESS', message, this.logFilePath)
  }

  phase(message: string) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`  ${message}`)
    console.log(`${'='.repeat(60)}\n`)
    this.writeLog('PHASE', message, this.logFilePath)
  }

  createProgressBar(total: number, label: string): cliProgress.SingleBar {
    this.progressBar = new cliProgress.SingleBar({
      format: `${label} [{bar}] {percentage}% | {value}/{total} | ETA: {eta}s`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    })

    this.progressBar.start(total, 0)
    return this.progressBar
  }

  stopProgressBar() {
    if (this.progressBar) {
      this.progressBar.stop()
      this.progressBar = null
    }
  }

  summary(stats: any) {
    console.log('\n' + '='.repeat(60))
    console.log('  MIGRATION SUMMARY')
    console.log('='.repeat(60))

    Object.entries(stats).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
      console.log(`  ${label}: ${value}`)
    })

    console.log('='.repeat(60) + '\n')
    this.writeLog('SUMMARY', JSON.stringify(stats, null, 2), this.logFilePath)
  }
}
