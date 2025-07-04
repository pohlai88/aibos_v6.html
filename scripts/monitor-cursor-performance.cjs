#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${colors.bright}${colors.blue}=== ${title} ===${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function getSystemInfo() {
  try {
    const platform = process.platform;
    const arch = process.arch;
    const nodeVersion = process.version;
    const memoryUsage = process.memoryUsage();
    
    return {
      platform,
      arch,
      nodeVersion,
      memoryUsage: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024)
      }
    };
  } catch (error) {
    return { error: error.message };
  }
}

function getCursorProcesses() {
  try {
    if (process.platform === 'win32') {
      const output = execSync('tasklist /FI "IMAGENAME eq Cursor.exe" /FO CSV', { encoding: 'utf8' });
      return output.split('\n').filter(line => line.includes('Cursor.exe')).length;
    } else {
      const output = execSync('pgrep -c Cursor', { encoding: 'utf8' });
      return parseInt(output.trim()) || 0;
    }
  } catch (error) {
    return 0;
  }
}

function getProjectStats() {
  const projectRoot = process.cwd();
  
  function countFiles(dir, extensions) {
    let count = 0;
    try {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
          if (!file.name.startsWith('.') && file.name !== 'node_modules' && file.name !== 'dist') {
            count += countFiles(fullPath, extensions);
          }
        } else {
          const ext = path.extname(file.name);
          if (extensions.includes(ext)) {
            count++;
          }
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
    return count;
  }
  
  return {
    typescriptFiles: countFiles(projectRoot, ['.ts', '.tsx']),
    pythonFiles: countFiles(projectRoot, ['.py']),
    jsonFiles: countFiles(projectRoot, ['.json']),
    markdownFiles: countFiles(projectRoot, ['.md']),
    sqlFiles: countFiles(projectRoot, ['.sql'])
  };
}

function checkPerformanceIssues() {
  const issues = [];
  
  // Check for large files
  const largeFiles = [];
  function scanForLargeFiles(dir, maxSize = 1024 * 1024) { // 1MB
    try {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
          if (!file.name.startsWith('.') && file.name !== 'node_modules' && file.name !== 'dist') {
            scanForLargeFiles(fullPath, maxSize);
          }
        } else {
          try {
            const stats = fs.statSync(fullPath);
            if (stats.size > maxSize) {
              largeFiles.push({
                path: fullPath.replace(process.cwd(), ''),
                size: Math.round(stats.size / 1024 / 1024 * 100) / 100
              });
            }
          } catch (error) {
            // Ignore permission errors
          }
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }
  
  scanForLargeFiles(process.cwd());
  
  if (largeFiles.length > 0) {
    issues.push({
      type: 'large_files',
      message: `Found ${largeFiles.length} large files that may impact performance`,
      files: largeFiles.slice(0, 5) // Show first 5
    });
  }
  
  // Check for too many files
  const stats = getProjectStats();
  const totalFiles = stats.typescriptFiles + stats.pythonFiles + stats.jsonFiles + stats.markdownFiles + stats.sqlFiles;
  
  if (totalFiles > 1000) {
    issues.push({
      type: 'many_files',
      message: `Large project with ${totalFiles} files - consider workspace optimization`
    });
  }
  
  return issues;
}

function generateRecommendations(issues, stats) {
  const recommendations = [];
  
  if (issues.some(i => i.type === 'large_files')) {
    recommendations.push({
      priority: 'high',
      message: 'Large files detected - consider splitting or optimizing',
      action: 'Review and split files larger than 1MB'
    });
  }
  
  if (stats.typescriptFiles > 500) {
    recommendations.push({
      priority: 'medium',
      message: 'Many TypeScript files - enable lazy loading',
      action: 'Implement React.lazy() for module imports'
    });
  }
  
  if (stats.pythonFiles > 200) {
    recommendations.push({
      priority: 'medium',
      message: 'Many Python files - optimize imports',
      action: 'Use relative imports and avoid circular dependencies'
    });
  }
  
  recommendations.push({
    priority: 'low',
    message: 'General performance optimization',
    action: 'Use .vscode/settings.json exclusions for better performance'
  });
  
  return recommendations;
}

function main() {
  logSection('Cursor Performance Monitor');
  
  // System Information
  logSection('System Information');
  const systemInfo = getSystemInfo();
  log(`Platform: ${systemInfo.platform} (${systemInfo.arch})`);
  log(`Node.js: ${systemInfo.nodeVersion}`);
  log(`Memory Usage: ${systemInfo.memoryUsage.rss}MB RSS, ${systemInfo.memoryUsage.heapUsed}MB Heap`);
  
  // Cursor Processes
  logSection('Cursor Processes');
  const cursorProcesses = getCursorProcesses();
  if (cursorProcesses > 0) {
    logSuccess(`Cursor processes running: ${cursorProcesses}`);
  } else {
    logWarning('No Cursor processes detected');
  }
  
  // Project Statistics
  logSection('Project Statistics');
  const stats = getProjectStats();
  log(`TypeScript files: ${stats.typescriptFiles}`);
  log(`Python files: ${stats.pythonFiles}`);
  log(`JSON files: ${stats.jsonFiles}`);
  log(`Markdown files: ${stats.markdownFiles}`);
  log(`SQL files: ${stats.sqlFiles}`);
  
  // Performance Issues
  logSection('Performance Analysis');
  const issues = checkPerformanceIssues();
  
  if (issues.length === 0) {
    logSuccess('No performance issues detected');
  } else {
    issues.forEach(issue => {
      logWarning(issue.message);
      if (issue.files) {
        issue.files.forEach(file => {
          log(`  - ${file.path} (${file.size}MB)`, colors.cyan);
        });
      }
    });
  }
  
  // Recommendations
  logSection('Optimization Recommendations');
  const recommendations = generateRecommendations(issues, stats);
  
  recommendations.forEach(rec => {
    const priorityColor = rec.priority === 'high' ? colors.red : 
                         rec.priority === 'medium' ? colors.yellow : colors.green;
    log(`${rec.priority.toUpperCase()}: ${rec.message}`, priorityColor);
    log(`  Action: ${rec.action}`, colors.cyan);
  });
  
  // Quick Actions
  logSection('Quick Actions');
  log('1. Restart Cursor if experiencing slowdowns');
  log('2. Close unused editor tabs');
  log('3. Disable unnecessary extensions');
  log('4. Use workspace-specific settings (.vscode/settings.json)');
  log('5. Consider splitting large files');
  
  logSection('Performance Monitor Complete');
}

if (require.main === module) {
  main();
}

module.exports = {
  getSystemInfo,
  getCursorProcesses,
  getProjectStats,
  checkPerformanceIssues,
  generateRecommendations
}; 